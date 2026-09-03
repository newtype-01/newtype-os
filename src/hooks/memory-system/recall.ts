import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { createMemoryPaths } from "./paths"
import { parseDailyLogSessions } from "./storage"

const MAX_RECALL_ENTRIES = 5
const MAX_RECALL_LENGTH = 1500
const MAX_LONGTERM_ENTRIES = 8
const MAX_LONGTERM_LENGTH = 800

interface RecallCandidate {
  line: string
  score: number
  recent: number
}

function extractTopic(raw: string): string {
  const topic = raw.match(/^\*\*Topic:\*\*\s*(.+)$/m)?.[1]?.trim()
  if (topic) return topic
  return raw
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("SessionID:") && !line.startsWith("Full transcript:") && !(line.startsWith("**") && line.endsWith(":**"))) ?? ""
}

export function recallTokens(value?: string) {
  if (!value?.trim()) return []
  return Array.from(new Set(
    value
      .toLowerCase()
      .split(/[^\p{L}\p{N}_-]+/u)
      .filter((word) => word.length > 1)
      .flatMap((word) =>
        /[\u3400-\u9fff]/u.test(word) && word.length > 2
          ? Array.from({ length: word.length - 1 }, (_, index) => word.slice(index, index + 2))
          : [word],
      ),
  )).slice(0, 24)
}

function score(raw: string, tags: string[], keywords: string[]) {
  const lower = raw.toLowerCase()
  const topic = extractTopic(raw).toLowerCase()
  return keywords.reduce((total, keyword) =>
    total + Number(lower.includes(keyword)) + Number(topic.includes(keyword)) * 2 + Number(tags.some((tag) => tag.toLowerCase().includes(keyword))), 0)
}

function select(candidates: RecallCandidate[], keywords: string[], limit: number) {
  return candidates
    .filter((candidate) => !keywords.length || candidate.score > 0)
    .sort((left, right) => keywords.length ? right.score - left.score || right.recent - left.recent : right.recent - left.recent)
    .slice(0, limit)
}

export function getRecentMemoryContext(project: string, prompt?: string): string | null {
  const memory = createMemoryPaths(project).memory
  if (!existsSync(memory)) return null
  const keywords = recallTokens(prompt)
  const seen = new Set<string>()
  const files = readdirSync(memory).filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file)).sort().reverse()
  const candidates = files.flatMap((file, fileIndex) => {
    try {
      return parseDailyLogSessions(readFileSync(join(memory, file), "utf-8")).flatMap((session, sessionIndex) => {
        if (session.sessionID && seen.has(session.sessionID)) return []
        if (session.sessionID) seen.add(session.sessionID)
        const topic = extractTopic(session.raw)
        if (!topic) return []
        const id = session.sessionID ? ` (${session.sessionID.slice(0, 12)})` : ""
        const tags = session.tags.length ? ` [${session.tags.join(", ")}]` : ""
        return [{
          line: `- ${file.replace(/\.md$/, "")}${id}: ${topic.slice(0, 120)}${tags}`,
          score: score(session.raw, session.tags, keywords),
          recent: (files.length - fileIndex) * 1000 + sessionIndex,
        }]
      })
    } catch {
      return []
    }
  })
  const body = select(candidates, keywords, MAX_RECALL_ENTRIES).map((candidate) => candidate.line).join("\n")
  if (!body) return null
  return `[Recent Memory Context]\n${body.slice(0, MAX_RECALL_LENGTH)}\n\nUse \`knowledge_base\` to retrieve full details if needed.`
}

export function getLongTermMemoryContext(project: string, prompt?: string): string | null {
  const root = createMemoryPaths(project).root
  if (!existsSync(root)) return null
  const keywords = recallTokens(prompt)
  const seen = new Set<string>()
  const files = readdirSync(root)
    .filter((file) => /^MEMORY(?:\.\d+)?\.md$/.test(file))
    .sort((left, right) => left === "MEMORY.md" ? -1 : right === "MEMORY.md" ? 1 : left.localeCompare(right))
  const candidates = files.flatMap((file, fileIndex) => {
    try {
      const content = readFileSync(join(root, file), "utf-8")
      return parseDailyLogSessions(content).flatMap((session, sessionIndex) => {
        if (session.sessionID && seen.has(session.sessionID)) return []
        if (session.sessionID) seen.add(session.sessionID)
        const topic = extractTopic(session.raw)
        if (!topic) return []
        const before = content.slice(0, content.indexOf(session.raw))
        const date = before.match(/### From (\d{4}-\d{2}-\d{2})/g)?.at(-1)?.slice(9)
        return [{
          line: `- ${date ? `${date}: ` : ""}${topic.slice(0, 120)}`,
          score: score(session.raw, session.tags, keywords),
          recent: (files.length - fileIndex) * 1000 + sessionIndex,
        }]
      })
    } catch {
      return []
    }
  })
  const lines = select(candidates, keywords, MAX_LONGTERM_ENTRIES).map((candidate) => candidate.line)
  const body = lines.join("\n").slice(0, MAX_LONGTERM_LENGTH)
  return body ? `[Long-term Memory Topics]\n${body}\n\nUse \`knowledge_base\` with source \`archive\` for details.` : null
}
