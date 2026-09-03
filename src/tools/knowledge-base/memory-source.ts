import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { createMemoryPaths } from "../../hooks/memory-system/paths"
import { getFullTranscriptPath, parseDailyLogSessions } from "../../hooks/memory-system/storage"
import { recallTokens } from "../../hooks/memory-system/recall"
import type { MemoryListEntry, MemorySearchResult } from "./types"
import { extractSnippet, extractSummaryLine, formatMemoryList, formatMemorySearchResults } from "./utils"

function dateFiles(project: string) {
  const memory = createMemoryPaths(project).memory
  if (!existsSync(memory)) return []
  return readdirSync(memory)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort()
    .reverse()
    .map((file) => ({ file: join(memory, file), date: file.replace(/\.md$/, "") }))
}

export function listMemoryEntries(project: string, limit?: number): string {
  const seen = new Set<string>()
  const entries: MemoryListEntry[] = []
  for (const item of dateFiles(project)) {
    for (const session of parseDailyLogSessions(readFileSync(item.file, "utf-8"))) {
      if (entries.length >= (limit ?? 20)) break
      if (session.sessionID && seen.has(session.sessionID)) continue
      if (session.sessionID) seen.add(session.sessionID)
      entries.push({
        date: item.date,
        sessionID: session.sessionID,
        tags: session.tags,
        decisionsCount: session.decisions.length,
        todosCount: session.todos.length,
        summaryLine: extractSummaryLine(session.raw),
      })
    }
  }
  return formatMemoryList(entries)
}

export function searchMemoryEntries(project: string, query: string, limit?: number): string {
  const keywords = recallTokens(query)
  const seen = new Set<string>()
  const results: Array<MemorySearchResult & { score: number }> = []
  for (const item of dateFiles(project)) {
    for (const session of parseDailyLogSessions(readFileSync(item.file, "utf-8"))) {
      if (session.sessionID && seen.has(session.sessionID)) continue
      if (session.sessionID) seen.add(session.sessionID)
      const lower = session.raw.toLowerCase()
      const topic = extractSummaryLine(session.raw).toLowerCase()
      const score = keywords.reduce((total, keyword) =>
        total + Number(lower.includes(keyword)) + Number(topic.includes(keyword)) * 2 + Number(session.tags.some((tag) => tag.toLowerCase().includes(keyword))), 0)
      if (keywords.length && !score) continue
      results.push({
        date: item.date,
        sessionID: session.sessionID,
        tags: session.tags,
        snippet: extractSnippet(session.raw, query),
        matchCount: score || 1,
        score,
      })
    }
  }
  results.sort((left, right) => right.score - left.score)
  return formatMemorySearchResults(results.slice(0, limit ?? 10), query)
}

export function getMemoryEntry(project: string, id: string, includeFull?: boolean): string {
  const parts = id.split("/")
  const date = parts[0]
  const sessionID = parts[1]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) return `Invalid id format: ${id}. Expected YYYY-MM-DD or YYYY-MM-DD/sessionID`
  const file = join(createMemoryPaths(project).memory, `${date}.md`)
  if (!existsSync(file)) return `Memory entry not found: ${id}`
  try {
    const sessions = parseDailyLogSessions(readFileSync(file, "utf-8"))
    if (!sessionID) return sessions.map((session) => session.raw).join("\n\n---\n\n") || `Memory entry not found: ${id}`
    const session = sessions.find((item) => item.sessionID === sessionID || item.sessionID?.startsWith(sessionID))
    if (!session) return `Memory entry not found: ${id}`
    if (!includeFull || !session.sessionID) return session.raw
    const full = getFullTranscriptPath(project, session.sessionID)
    return existsSync(full)
      ? `${session.raw}\n\n---\n\n## Full Transcript\n\n${readFileSync(full, "utf-8")}`
      : `${session.raw}\n\n_(Full transcript not available)_`
  } catch (error) {
    return `Error reading memory entry: ${error instanceof Error ? error.message : String(error)}`
  }
}
