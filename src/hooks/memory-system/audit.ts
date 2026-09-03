import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs"
import { basename, join } from "node:path"
import { createMemoryPaths } from "./paths"
import {
  deduplicateMemory,
  listMemoryDocumentPaths,
  normalizeMemoryLinks,
  parseDailyLogSessions,
  readMemoryIndex,
  rebuildMemoryIndex,
  type MemoryStorageOptions,
} from "./storage"

export interface MemoryAuditReport {
  version: 1
  root: string
  documents: number
  sessions: number
  transcripts: number
  duplicate_sessions: string[]
  broken_links: string[]
  missing_transcripts: string[]
  transcript_only: string[]
  index_valid: boolean
  repaired: number
}

export function auditMemory(
  project: string,
  options: MemoryStorageOptions & { apply?: boolean } = {},
): MemoryAuditReport {
  const paths = createMemoryPaths(project, options.rootName)
  const documents = listMemoryDocumentPaths(project, options)
  const counts = new Map<string, number>()
  const brokenLinks = new Set<string>()
  for (const document of documents) {
    for (const session of parseDailyLogSessions(readFileSync(document, "utf-8"))) {
      if (!session.sessionID) continue
      counts.set(session.sessionID, (counts.get(session.sessionID) ?? 0) + 1)
      const expected = `${paths.rootName}/memory/full/${session.sessionID.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`
      const current = session.raw.match(/Full transcript:\s*`([^`]+)`/)?.[1]
      if (current && current !== expected) brokenLinks.add(session.sessionID)
    }
  }
  const transcripts = existsSync(paths.full)
    ? readdirSync(paths.full).filter((file) => file.endsWith(".md"))
    : []
  const transcriptIDs = new Set(
    transcripts.map((file) => {
      const content = readFileSync(`${paths.full}/${file}`, "utf-8")
      return content.match(/^# Full Transcript - (.+)$/m)?.[1]?.trim() ?? basename(file, ".md")
    }),
  )
  const sessionIDs = new Set(counts.keys())
  const duplicateSessions = [...counts].filter(([, count]) => count > 1).map(([sessionID]) => sessionID)
  if (options.apply) {
    if (duplicateSessions.length || brokenLinks.size) {
      const backup = join(
        paths.migrations,
        `audit-${new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-")}`,
      )
      mkdirSync(backup, { recursive: true })
      documents.forEach((document) => copyFileSync(document, join(backup, basename(document))))
    }
    const repaired = deduplicateMemory(project, options) + normalizeMemoryLinks(project, options)
    rebuildMemoryIndex(project, options)
    return { ...auditMemory(project, { ...options, apply: false }), repaired }
  }
  const index = readMemoryIndex(project, options)
  return {
    version: 1,
    root: paths.root,
    documents: documents.length,
    sessions: sessionIDs.size,
    transcripts: transcriptIDs.size,
    duplicate_sessions: duplicateSessions,
    broken_links: [...brokenLinks],
    missing_transcripts: [...sessionIDs].filter((sessionID) => !transcriptIDs.has(sessionID)),
    transcript_only: [...transcriptIDs].filter((sessionID) => !sessionIDs.has(sessionID)),
    index_valid: Boolean(index),
    repaired: 0,
  }
}
