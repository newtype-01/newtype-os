import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { createMemoryPaths } from "../../hooks/memory-system/paths"
import { recallTokens } from "../../hooks/memory-system/recall"
import { parseDailyLogSessions } from "../../hooks/memory-system/storage"
import type { MemoryListEntry, MemorySearchResult } from "./types"
import { extractSnippet, extractSummaryLine, formatMemoryList, formatMemorySearchResults } from "./utils"

interface ArchiveEntry {
  date: string
  sessionID?: string
  raw: string
  tags: string[]
  decisions: string[]
  todos: string[]
}

function entries(project: string): ArchiveEntry[] {
  const root = createMemoryPaths(project).root
  if (!existsSync(root)) return []
  const seen = new Set<string>()
  return readdirSync(root)
    .filter((file) => /^MEMORY(?:\.\d+)?\.md$/.test(file))
    .sort((left, right) => left === "MEMORY.md" ? -1 : right === "MEMORY.md" ? 1 : left.localeCompare(right))
    .flatMap((file) => {
      const content = readFileSync(join(root, file), "utf-8")
      return parseDailyLogSessions(content).flatMap((session) => {
        if (session.sessionID && seen.has(session.sessionID)) return []
        if (session.sessionID) seen.add(session.sessionID)
        const position = content.indexOf(session.raw)
        const date = content.slice(0, position).match(/### From (\d{4}-\d{2}-\d{2})/g)?.at(-1)?.slice(9) ?? "unknown"
        return [{ date, sessionID: session.sessionID, raw: session.raw, tags: session.tags, decisions: session.decisions, todos: session.todos }]
      })
    })
}

export function listArchiveEntries(project: string, limit?: number): string {
  const list: MemoryListEntry[] = entries(project).slice(0, limit ?? 20).map((entry) => ({
    date: entry.date,
    sessionID: entry.sessionID,
    tags: entry.tags,
    decisionsCount: entry.decisions.length,
    todosCount: entry.todos.length,
    summaryLine: extractSummaryLine(entry.raw),
  }))
  return list.length ? `**Long-term Memory**\n\n${formatMemoryList(list)}` : "No archived entries found."
}

export function searchArchiveEntries(project: string, query: string, limit?: number): string {
  const keywords = recallTokens(query)
  const results = entries(project).flatMap((entry) => {
    const lower = entry.raw.toLowerCase()
    const score = keywords.reduce((total, keyword) => total + Number(lower.includes(keyword)), 0)
    if (keywords.length && !score) return []
    return [{
      date: entry.date,
      sessionID: entry.sessionID,
      tags: entry.tags,
      snippet: extractSnippet(entry.raw, query),
      matchCount: score || 1,
      score,
    } satisfies MemorySearchResult & { score: number }]
  }).sort((left, right) => right.score - left.score)
  return formatMemorySearchResults(results.slice(0, limit ?? 10), query)
}

export function getArchiveEntry(project: string, id: string): string {
  const parts = id.split("/")
  const date = parts[0]
  const sessionID = parts[1]
  const match = entries(project).find((entry) =>
    entry.date === date && (!sessionID || entry.sessionID === sessionID || entry.sessionID?.startsWith(sessionID)),
  )
  return match?.raw ?? `Archive entry not found: ${id}`
}
