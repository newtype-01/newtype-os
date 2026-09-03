import type { PluginInput } from "@opencode-ai/plugin"
import { HOOK_NAME } from "./constants"
import {
  appendMemoryEntry,
  archiveOldMemories,
  checkArchiveNeeded,
  hasMemoryForSession,
  rebuildMemoryIndex,
  saveFullTranscript,
  storedTranscriptHash,
  transcriptHash,
} from "./storage"
import {
  extractSessionSummaryFallback,
  formatTranscriptForLLM,
  generateSummaryPrompt,
  parseLLMSummary,
  prepareMessagesForSummary,
  stripSystemInstructionPrefix,
} from "./extractor"
import { log } from "../../shared/logger"
import { subagentSessions } from "../../features/claude-code-session-state"

interface MessagePart {
  type: string
  text?: string
}

interface MessageInfo {
  role: string
  id: string
  sessionID?: string
}

interface MessageWrapper {
  info: MessageInfo
  parts: MessagePart[]
}

interface FullTranscriptMessage {
  role: string
  text: string
  timestamp?: string
}

interface SessionState {
  saving?: Promise<void>
}

const ROOT_NAME = ".opencode"
const ARCHIVE_CHECK_COOLDOWN_MS = 60 * 60 * 1000

function extractMessageText(parts: MessagePart[]): string {
  return parts.filter((part) => part.type === "text" && part.text).map((part) => part.text!).join("\n")
}

function extractFullTranscript(messages: MessageWrapper[]): FullTranscriptMessage[] {
  return messages
    .map((message) => ({
      role: message.info.role,
      text: message.info.role === "user"
        ? stripSystemInstructionPrefix(extractMessageText(message.parts))
        : extractMessageText(message.parts),
    }))
    .filter((message) => message.text.trim().length > 0)
}

export function createMemorySystemHook(ctx: PluginInput) {
  const storage = { rootName: ROOT_NAME }
  const sessionStates = new Map<string, SessionState>()
  const rootSessions = new Set<string>()
  const childSessions = new Set<string>()
  const localWrites = new Set<Promise<void>>()
  const enrichment = new Set<Promise<void>>()
  const archiveState = { inProgress: false, lastCheck: 0 }

  function state(sessionID: string) {
    const existing = sessionStates.get(sessionID)
    if (existing) return existing
    const created: SessionState = {}
    sessionStates.set(sessionID, created)
    return created
  }

  function track<T>(set: Set<Promise<void>>, promise: Promise<T>): Promise<void> {
    const tracked = promise.then(
      () => undefined,
      (error) => log(`[${HOOK_NAME}] Background memory task failed`, { error: String(error) }),
    )
    set.add(tracked)
    void tracked.then(() => set.delete(tracked))
    return tracked
  }

  async function runArchivistSummary(prompt: string, parentID?: string): Promise<string | null> {
    try {
      const result = await ctx.client.session.create({
        body: { title: "Memory: Deep Summary", ...(parentID ? { parentID } : {}) },
      })
      if (result.error) return null
      const sessionID = result.data.id
      subagentSessions.add(sessionID)
      childSessions.add(sessionID)
      await ctx.client.session.prompt({
        path: { id: sessionID },
        body: { agent: "archivist", parts: [{ type: "text", text: prompt }] },
      })
      const response = await ctx.client.session.messages({ path: { id: sessionID } })
      const messages = ((response as { data?: unknown }).data ?? response) as MessageWrapper[]
      return messages
        .filter((message) => message.info.role === "assistant")
        .at(-1)
        ?.parts.filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("\n")
        .trim() || null
    } catch {
      return null
    }
  }

  async function enrichSummary(sessionID: string, expectedHash: string, messages: MessageWrapper[]) {
    const prepared = prepareMessagesForSummary(messages)
    if (!prepared.length) return
    const summary = await runArchivistSummary(generateSummaryPrompt(formatTranscriptForLLM(prepared)), sessionID)
    if (!summary || storedTranscriptHash(ctx.directory, sessionID, storage) !== expectedHash) return
    const entry = parseLLMSummary(sessionID, summary)
    if (!entry) return
    appendMemoryEntry(ctx.directory, entry, { ...storage, summaryKind: "llm" })
    log(`[${HOOK_NAME}] LLM summary enriched`, { sessionID })
  }

  async function checkAndArchive() {
    const now = Date.now()
    if (archiveState.inProgress || now - archiveState.lastCheck < ARCHIVE_CHECK_COOLDOWN_MS) return
    archiveState.lastCheck = now
    const check = checkArchiveNeeded(ctx.directory, undefined, storage)
    if (!check.needsArchive) return
    archiveState.inProgress = true
    try {
      await archiveOldMemories(ctx.directory, {
        ...storage,
        deepSummarizer: (session, fullContent) => runArchivistSummary([
          "Summarize the full transcript into long-term memory entries.",
          "Output concise Markdown sections for preferences, decisions, and lessons only.",
          "Do not include sensitive data or raw conversation.",
          `Transcript:\n${fullContent}`,
        ].join("\n\n"), session.sessionID),
      })
      log(`[${HOOK_NAME}] Archive complete`, { count: check.archived.length })
    } catch (error) {
      log(`[${HOOK_NAME}] Archive failed`, { error: String(error) })
    } finally {
      archiveState.inProgress = false
    }
  }

  async function persistSession(sessionID: string) {
    const current = state(sessionID)
    if (current.saving) return current.saving
    const saving = (async () => {
      const response = await ctx.client.session.messages({
        path: { id: sessionID },
        query: { directory: ctx.directory },
      })
      const messages = (response.data ?? response) as MessageWrapper[]
      const transcript = extractFullTranscript(messages)
      if (!transcript.length) return
      const contentHash = transcriptHash(transcript)
      if (storedTranscriptHash(ctx.directory, sessionID, storage) === contentHash && hasMemoryForSession(ctx.directory, sessionID, storage)) return
      const fullSaved = saveFullTranscript(ctx.directory, sessionID, transcript, storage)
      const entry = extractSessionSummaryFallback(sessionID, messages)
      const summarySaved = appendMemoryEntry(ctx.directory, entry, { ...storage, summaryKind: "fallback" })
      if (!fullSaved || !summarySaved) throw new Error(`Could not persist ${sessionID}`)
      log(`[${HOOK_NAME}] Memory checkpoint saved`, { sessionID, messages: messages.length })
      track(enrichment, enrichSummary(sessionID, contentHash, messages))
      track(enrichment, checkAndArchive())
    })().catch((error) => log(`[${HOOK_NAME}] Error saving memory`, { sessionID, error: String(error) }))
    current.saving = track(localWrites, saving).finally(() => {
      if (state(sessionID).saving === current.saving) current.saving = undefined
    })
    return current.saving
  }

  async function isRootSession(sessionID: string) {
    if (childSessions.has(sessionID) || subagentSessions.has(sessionID)) return false
    if (rootSessions.has(sessionID)) return true
    const response = await ctx.client.session.get({
      path: { id: sessionID },
      query: { directory: ctx.directory },
    }).catch(() => undefined)
    const info = response?.data as { parentID?: string } | undefined
    if (info?.parentID) {
      childSessions.add(sessionID)
      return false
    }
    rootSessions.add(sessionID)
    return true
  }

  return {
    event: async ({ event }: { event: { type: string; properties?: unknown } }) => {
      const props = event.properties as Record<string, unknown> | undefined
      if (event.type === "session.created") {
        const info = props?.info as { id?: string; parentID?: string } | undefined
        if (!info?.id) return
        if (info.parentID) childSessions.add(info.id)
        else rootSessions.add(info.id)
        return
      }
      if (event.type === "session.idle") {
        const sessionID = props?.sessionID as string | undefined
        if (sessionID && await isRootSession(sessionID)) await persistSession(sessionID)
        return
      }
      if (event.type !== "session.deleted") return
      const sessionID = (props?.info as { id?: string } | undefined)?.id
      if (!sessionID) return
      const current = sessionStates.get(sessionID)
      if (current?.saving) await current.saving
      sessionStates.delete(sessionID)
      rootSessions.delete(sessionID)
      childSessions.delete(sessionID)
    },
    dispose: async () => {
      await Promise.allSettled(localWrites)
      enrichment.clear()
    },
  }
}

export { HOOK_NAME } from "./constants"
