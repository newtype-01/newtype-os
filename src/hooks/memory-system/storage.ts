import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, join } from "node:path"
import { createHash, randomUUID } from "node:crypto"
import {
  ARCHIVE_AFTER_DAYS,
  DEEP_SUMMARY_TAGS,
  MAX_MEMORY_FILE_SIZE,
  MAX_MEMORY_ROTATIONS,
  MAX_SUMMARY_LENGTH,
} from "./constants"
import { createMemoryPaths } from "./paths"
import type { MemoryEntry, MemoryEntryMessage } from "./types"
import { looksLikeTranscript, sanitizeArchivistOutput } from "./extractor"

export interface MemoryStorageOptions {
  rootName?: string
  archiveAfterDays?: number
  maxFileSize?: number
  maxRotations?: number
}

export interface ArchiveResult {
  archived: string[]
  totalFiles: number
  needsArchive: boolean
}

export interface FullTranscriptBlock {
  role: string
  content: string
}

export interface MemorySummary {
  userPreferences: string[]
  decisions: string[]
  lessons: string[]
}

export interface DailyLogSession {
  sessionID?: string
  raw: string
  tags: string[]
  decisions: string[]
  todos: string[]
}

export interface MemoryIndexSession {
  summary_file?: string
  summary_hash?: string
  transcript_file?: string
  transcript_hash?: string
  updated_at: string
  summary_kind?: "fallback" | "llm" | "migrated"
  transcript_only?: boolean
}

export interface MemoryIndex {
  version: 1
  sessions: Record<string, MemoryIndexSession>
}

function localDate(value = new Date()): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function atomicWrite(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.tmp.${process.pid}.${randomUUID()}`
  writeFileSync(temporary, content, "utf-8")
  renameSync(temporary, path)
}

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex")
}

function parseDateFromFileName(fileName: string): Date | null {
  const match = fileName.match(/^(\d{4})-(\d{2})-(\d{2})\.md$/)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function getDaysDiff(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function extractSectionItems(block: string, title: string): string[] {
  const pattern = new RegExp(`\\*\\*${title}:\\*\\*\\n([\\s\\S]*?)(?:\\n\\*\\*|$)`)
  const match = block.match(pattern)
  if (!match) return []
  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^\-\s+/, ""))
    .filter(Boolean)
}

function memoryFiles(projectDir: string, rootName = ".opencode"): string[] {
  const paths = createMemoryPaths(projectDir, rootName)
  const daily = existsSync(paths.memory)
    ? readdirSync(paths.memory)
        .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
        .map((file) => join(paths.memory, file))
    : []
  const archives = existsSync(paths.root)
    ? readdirSync(paths.root)
        .filter((file) => /^MEMORY(?:\.\d+)?\.md$/.test(file))
        .map((file) => join(paths.root, file))
    : []
  return [...daily, ...archives]
}

export function listMemoryDocumentPaths(projectDir: string, options: MemoryStorageOptions = {}): string[] {
  return memoryFiles(projectDir, options.rootName)
}

function sessionSegment(content: string, sessionID: string): { start: number; end: number } | undefined {
  const index = content.indexOf(`SessionID: ${sessionID}`)
  if (index === -1) return
  const start = content.lastIndexOf("## Session:", index)
  if (start === -1) return
  const separator = content.indexOf("\n---\n", index)
  return { start, end: separator === -1 ? content.length : separator + "\n---\n".length }
}

function renderMemoryEntry(entry: MemoryEntry, rootName: string): string {
  const safeSessionID = entry.sessionID.replace(/[^a-zA-Z0-9_-]/g, "_")
  const sections: string[] = [
    `## Session: ${entry.sessionID.slice(0, 12)} (${formatTime(new Date(entry.timestamp))})`,
    `SessionID: ${entry.sessionID}`,
    `Full transcript: \`${rootName}/memory/full/${safeSessionID}.md\``,
    "",
  ]
  const summaryHasStructuredFields = entry.summary?.includes("**Key Points:**")
  if (entry.summary) {
    sections.push(entry.summary.length > MAX_SUMMARY_LENGTH ? `${entry.summary.slice(0, MAX_SUMMARY_LENGTH)}...` : entry.summary, "")
  }
  if (!summaryHasStructuredFields) {
    if (entry.keyPoints?.length) sections.push("**Key Points:**", ...entry.keyPoints.map((point) => `- ${point}`), "")
    if (entry.decisions?.length) sections.push("**Decisions:**", ...entry.decisions.map((item) => `- ${item}`), "")
    if (entry.todos?.length) sections.push("**TODOs:**", ...entry.todos.map((item) => `- [ ] ${item}`), "")
    if (entry.tags?.length) sections.push("**Tags:**", ...entry.tags.map((item) => `- ${item}`), "")
  }
  return `${sections.join("\n").trim()}\n\n---\n`
}

function rotateMemoryFile(projectDir: string, options: MemoryStorageOptions, incomingSize: number): void {
  const paths = createMemoryPaths(projectDir, options.rootName)
  if (!existsSync(paths.longTerm)) return
  if (statSync(paths.longTerm).size + incomingSize < (options.maxFileSize ?? MAX_MEMORY_FILE_SIZE)) return
  const rotations = options.maxRotations ?? MAX_MEMORY_ROTATIONS
  if (rotations === 0) return
  for (let index = rotations; index >= 1; index--) {
    const source = index === 1 ? paths.longTerm : paths.longTerm.replace(/\.md$/, `.${index - 1}.md`)
    const target = paths.longTerm.replace(/\.md$/, `.${index}.md`)
    if (!existsSync(source)) continue
    if (index === rotations && existsSync(target)) unlinkSync(target)
    renameSync(source, target)
  }
}

export function checkArchiveNeeded(
  projectDir: string,
  archiveAfterDays?: number,
  options: MemoryStorageOptions = {},
): ArchiveResult {
  const paths = createMemoryPaths(projectDir, options.rootName)
  if (!existsSync(paths.memory)) return { archived: [], totalFiles: 0, needsArchive: false }
  const files = readdirSync(paths.memory).filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
  const archived = files.filter((file) => {
    const date = parseDateFromFileName(file)
    return date ? getDaysDiff(date) >= (archiveAfterDays ?? options.archiveAfterDays ?? ARCHIVE_AFTER_DAYS) : false
  })
  return { archived, totalFiles: files.length, needsArchive: archived.length > 0 }
}

export async function archiveOldMemories(
  projectDir: string,
  options: MemoryStorageOptions & {
    deepSummarizer?: (session: DailyLogSession, fullContent: string) => Promise<string | null>
  } = {},
): Promise<ArchiveResult> {
  const checkResult = checkArchiveNeeded(projectDir, options.archiveAfterDays, options)
  if (!checkResult.needsArchive) return checkResult
  const paths = createMemoryPaths(projectDir, options.rootName)
  const archivedContent: string[] = [`\n\n## Archived: ${localDate()}\n\n`]
  const completed: string[] = []

  for (const file of checkResult.archived.sort()) {
    const filePath = join(paths.memory, file)
    try {
      const sessions = parseDailyLogSessions(readFileSync(filePath, "utf-8"))
      archivedContent.push(`### From ${file.replace(/\.md$/, "")}\n\n`)
      for (const session of sessions) {
        const raw = sanitizeArchivistOutput(session.raw)
        if (raw) archivedContent.push(raw, "", "---", "")
        if (!session.sessionID || !shouldDeepSummarize(session)) continue
        const fullPath = getFullTranscriptPath(projectDir, session.sessionID, options)
        if (!existsSync(fullPath)) continue
        const fullContent = readFileSync(fullPath, "utf-8")
        let deepSummary = options.deepSummarizer ? await options.deepSummarizer(session, fullContent) : null
        if (deepSummary) {
          deepSummary = sanitizeArchivistOutput(deepSummary)
          if (!deepSummary || looksLikeTranscript(deepSummary)) deepSummary = null
        }
        if (!deepSummary) {
          const summary = summarizeFullTranscript(fullContent)
          deepSummary = [
            summary.userPreferences.length ? ["**User Preferences:**", ...summary.userPreferences.map((item) => `- ${item}`)].join("\n") : "",
            summary.decisions.length ? ["**Decisions Made:**", ...summary.decisions.map((item) => `- ${item}`)].join("\n") : "",
            summary.lessons.length ? ["**Lessons Learned:**", ...summary.lessons.map((item) => `- ${item}`)].join("\n") : "",
          ].filter(Boolean).join("\n\n")
        }
        if (deepSummary) archivedContent.push(`#### Deep Summary (${session.sessionID.slice(0, 12)})`, "", deepSummary, "", "---", "")
      }
      completed.push(file)
    } catch {
      continue
    }
  }

  if (!completed.length) return { ...checkResult, archived: [] }
  const addition = archivedContent.join("\n")
  rotateMemoryFile(projectDir, options, Buffer.byteLength(addition))
  const header = existsSync(paths.longTerm)
    ? readFileSync(paths.longTerm, "utf-8")
    : "# Long-term Memory\n\nThis file contains archived conversation memories.\n"
  atomicWrite(paths.longTerm, `${header}${addition}`)
  completed.forEach((file) => unlinkSync(join(paths.memory, file)))
  rebuildMemoryIndex(projectDir, options)
  return { archived: completed, totalFiles: checkResult.totalFiles - completed.length, needsArchive: false }
}

export function parseDailyLogSessions(content: string): DailyLogSession[] {
  const blocks = content
    .replace(/^# Memory Log.*\n\n?/, "")
    .split(/\n---\n/)
    .map((block) => block.trim())
    .filter(Boolean)
  return blocks.reduce<DailyLogSession[]>((sessions, block) => {
      const heading = block.lastIndexOf("## Session:")
      const raw = heading === -1 ? block : block.slice(heading)
      const sessionMatch = raw.match(/SessionID:\s*(.+)/)
      if (!sessionMatch && raw.includes("**Topic:**") && sessions.at(-1) && !sessions.at(-1)!.raw.includes("**Topic:**")) {
        const previous = sessions.at(-1)!
        previous.raw = `${previous.raw}\n\n${raw}`
        previous.tags = extractSectionItems(previous.raw, "Tags")
        previous.decisions = extractSectionItems(previous.raw, "Decisions")
        previous.todos = extractSectionItems(previous.raw, "TODOs").map((item) => item.replace(/^\[ \]\s+/, ""))
        return sessions
      }
      if (!sessionMatch && !raw.includes("**Topic:**")) return sessions
      sessions.push({
        sessionID: sessionMatch?.[1]?.trim(),
        raw,
        tags: extractSectionItems(raw, "Tags"),
        decisions: extractSectionItems(raw, "Decisions"),
        todos: extractSectionItems(raw, "TODOs").map((item) => item.replace(/^\[ \]\s+/, "")),
      })
      return sessions
    }, [])
}

export function shouldDeepSummarize(session: DailyLogSession): boolean {
  if (session.decisions.length > 0 || session.todos.length > 0) return true
  return session.tags.some((tag) => (DEEP_SUMMARY_TAGS as readonly string[]).includes(tag.toLowerCase()))
}

export function getFullTranscriptPath(
  projectDir: string,
  sessionID: string,
  options: MemoryStorageOptions = {},
): string {
  return join(createMemoryPaths(projectDir, options.rootName).full, `${sessionID.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`)
}

export function parseFullTranscript(content: string): FullTranscriptBlock[] {
  return content
    .replace(/^# Full Transcript.*\n.*\n\n?/, "")
    .split(/\n---\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n")
      const roleMatch = (lines.shift() ?? "").match(/^##\s+([A-Z]+)\b/)
      return { role: roleMatch?.[1]?.toLowerCase() ?? "unknown", content: lines.join("\n").trim() }
    })
}

export function summarizeFullTranscript(content: string): MemorySummary {
  const userPreferences: string[] = []
  const decisions: string[] = []
  const lessons: string[] = []
  for (const block of parseFullTranscript(content)) {
    if (block.role !== "user") continue
    for (const line of block.content.split("\n").filter((item) => item.trim())) {
      const trimmed = line.trim()
      if (trimmed.length < 10 || trimmed.length > 200) continue
      if (/^(我(决定|选择|要用|打算)|let'?s go with|decided|going with|will use)/i.test(trimmed)) decisions.push(trimmed)
      if (/^(我(喜欢|偏好|习惯|倾向)|i (prefer|like|want|always use|usually)|please (always|never))/i.test(trimmed)) userPreferences.push(trimmed)
      if (/^(原来|学到|注意|lesson|learned|turns out|realized|remember to|next time)/i.test(trimmed)) lessons.push(trimmed)
    }
  }
  const unique = (items: string[]) => Array.from(new Set(items)).slice(0, 10)
  return { userPreferences: unique(userPreferences), decisions: unique(decisions), lessons: unique(lessons) }
}

export function appendMemoryEntry(
  projectDir: string,
  entry: MemoryEntry,
  options: MemoryStorageOptions & { summaryKind?: MemoryIndexSession["summary_kind"] } = {},
): boolean {
  try {
    const paths = createMemoryPaths(projectDir, options.rootName)
    mkdirSync(paths.memory, { recursive: true })
    const rendered = renderMemoryEntry(entry, paths.rootName)
    const existing = memoryFiles(projectDir, options.rootName)
      .map((file) => ({ file, content: readFileSync(file, "utf-8") }))
      .map((candidate) => ({ ...candidate, segment: sessionSegment(candidate.content, entry.sessionID) }))
      .find((candidate) => candidate.segment)
    if (existing?.segment) {
      atomicWrite(existing.file, `${existing.content.slice(0, existing.segment.start)}${rendered}${existing.content.slice(existing.segment.end)}`)
    } else {
      const date = localDate(new Date(entry.timestamp))
      const filePath = join(paths.memory, `${date}.md`)
      const content = existsSync(filePath) ? readFileSync(filePath, "utf-8") : `# Memory Log - ${date}\n\n`
      atomicWrite(filePath, `${content.trimEnd()}\n\n${rendered}`)
    }
    rebuildMemoryIndex(projectDir, options, { [entry.sessionID]: options.summaryKind ?? "fallback" })
    return true
  } catch {
    return false
  }
}

export function hasMemoryForSession(projectDir: string, sessionID: string, options: MemoryStorageOptions = {}): boolean {
  try {
    const index = readMemoryIndex(projectDir, options)
    if (index?.sessions[sessionID]) return true
    return memoryFiles(projectDir, options.rootName).some((file) => readFileSync(file, "utf-8").includes(`SessionID: ${sessionID}`))
  } catch {
    return false
  }
}

export function saveFullTranscript(
  projectDir: string,
  sessionID: string,
  messages: MemoryEntryMessage[],
  options: MemoryStorageOptions = {},
): boolean {
  try {
    const paths = createMemoryPaths(projectDir, options.rootName)
    mkdirSync(paths.full, { recursive: true })
    const sections: string[] = [`# Full Transcript - ${sessionID}`, `Generated: ${new Date().toISOString()}`, ""]
    for (const message of messages) {
      const timestamp = message.timestamp ? ` (${message.timestamp})` : ""
      sections.push(`## ${message.role.toUpperCase()}${timestamp}`, "", message.text || "", "", "---", "")
    }
    atomicWrite(getFullTranscriptPath(projectDir, sessionID, options), sections.join("\n"))
    return true
  } catch {
    return false
  }
}

export function transcriptHash(messages: MemoryEntryMessage[]): string {
  return hash(JSON.stringify(messages.map((message) => ({ role: message.role, text: message.text }))))
}

export function storedTranscriptHash(projectDir: string, sessionID: string, options: MemoryStorageOptions = {}): string | undefined {
  const path = getFullTranscriptPath(projectDir, sessionID, options)
  if (!existsSync(path)) return
  try {
    return transcriptHash(parseFullTranscript(readFileSync(path, "utf-8")).map((block) => ({ role: block.role, text: block.content })))
  } catch {
    return
  }
}

export function readMemoryIndex(projectDir: string, options: MemoryStorageOptions = {}): MemoryIndex | undefined {
  const path = createMemoryPaths(projectDir, options.rootName).index
  if (!existsSync(path)) return
  try {
    const value = JSON.parse(readFileSync(path, "utf-8")) as MemoryIndex
    return value.version === 1 && value.sessions && typeof value.sessions === "object" ? value : undefined
  } catch {
    return
  }
}

export function rebuildMemoryIndex(
  projectDir: string,
  options: MemoryStorageOptions = {},
  kinds: Record<string, MemoryIndexSession["summary_kind"]> = {},
): MemoryIndex {
  const paths = createMemoryPaths(projectDir, options.rootName)
  const previous = readMemoryIndex(projectDir, options)
  const sessions: Record<string, MemoryIndexSession> = {}
  for (const file of memoryFiles(projectDir, options.rootName)) {
    const content = readFileSync(file, "utf-8")
    for (const session of parseDailyLogSessions(content)) {
      if (!session.sessionID || sessions[session.sessionID]) continue
      sessions[session.sessionID] = {
        summary_file: file.slice(paths.root.length + 1),
        summary_hash: hash(session.raw),
        updated_at: new Date(statSync(file).mtimeMs).toISOString(),
        summary_kind: kinds[session.sessionID] ?? previous?.sessions[session.sessionID]?.summary_kind ?? "migrated",
      }
    }
  }
  if (existsSync(paths.full)) {
    for (const file of readdirSync(paths.full).filter((item) => item.endsWith(".md"))) {
      const path = join(paths.full, file)
      const content = readFileSync(path, "utf-8")
      const sessionID = content.match(/^# Full Transcript - (.+)$/m)?.[1]?.trim() ?? basename(file, ".md")
      sessions[sessionID] = {
        ...sessions[sessionID],
        transcript_file: `memory/full/${file}`,
        transcript_hash: hash(content),
        updated_at: sessions[sessionID]?.updated_at ?? new Date(statSync(path).mtimeMs).toISOString(),
        transcript_only: !sessions[sessionID]?.summary_file,
      }
    }
  }
  const index: MemoryIndex = { version: 1, sessions }
  mkdirSync(paths.memory, { recursive: true })
  atomicWrite(paths.index, `${JSON.stringify(index, null, 2)}\n`)
  return index
}

export function deduplicateMemory(projectDir: string, options: MemoryStorageOptions = {}): number {
  const files = memoryFiles(projectDir, options.rootName).sort((left, right) => {
    const modified = statSync(left).mtimeMs - statSync(right).mtimeMs
    return modified || left.localeCompare(right)
  })
  const documents = files.map((file) => ({ file, content: readFileSync(file, "utf-8") }))
  const selected = new Map<string, { file: string; segment: number }>()
  documents.forEach((document) => document.content.split("\n---\n").forEach((segment, index) => {
    const sessionID = segment.match(/SessionID:\s*(.+)/)?.[1]?.trim()
    if (sessionID) selected.set(sessionID, { file: document.file, segment: index })
  }))
  let removed = 0
  for (const document of documents) {
    const next = document.content.split("\n---\n").flatMap((segment, index) => {
      const sessionID = segment.match(/SessionID:\s*(.+)/)?.[1]?.trim()
      if (!sessionID || selected.get(sessionID)?.file === document.file && selected.get(sessionID)?.segment === index) return [segment]
      removed++
      const heading = segment.lastIndexOf("## Session:")
      const prefix = heading === -1 ? "" : segment.slice(0, heading).trimEnd()
      return prefix ? [prefix] : []
    })
    const output = next.join("\n---\n")
    if (output !== document.content) atomicWrite(document.file, output.trimEnd() ? `${output.trimEnd()}\n` : "")
  }
  if (removed) rebuildMemoryIndex(projectDir, options)
  return removed
}

export function normalizeMemoryLinks(projectDir: string, options: MemoryStorageOptions = {}): number {
  const rootName = createMemoryPaths(projectDir, options.rootName).rootName
  let repaired = 0
  for (const file of memoryFiles(projectDir, rootName)) {
    const content = readFileSync(file, "utf-8")
    const output = content
      .split("\n---\n")
      .map((segment) => {
        const sessionID = segment.match(/SessionID:\s*(.+)/)?.[1]?.trim()
        if (!sessionID) return segment
        const expected = `${rootName}/memory/full/${sessionID.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`
        const current = segment.match(/Full transcript:\s*`([^`]+)`/)?.[1]
        if (!current || current === expected) return segment
        repaired++
        return segment.replace(/Full transcript:\s*`[^`]+`/, `Full transcript: \`${expected}\``)
      })
      .join("\n---\n")
    if (output !== content) atomicWrite(file, output)
  }
  if (repaired) rebuildMemoryIndex(projectDir, options)
  return repaired
}
