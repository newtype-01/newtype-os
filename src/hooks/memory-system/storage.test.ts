import { afterEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { appendMemoryEntry, archiveOldMemories, getFullTranscriptPath, saveFullTranscript } from "./storage"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function project() {
  const root = await mkdtemp(join(tmpdir(), "opencode-memory-storage-"))
  roots.push(root)
  return root
}

function entry(sessionID: string, topic: string) {
  return {
    sessionID,
    timestamp: "2026-01-01T08:00:00.000Z",
    summary: `**Topic:** ${topic}`,
    keyPoints: [topic],
  }
}

describe("memory storage", () => {
  test("upserts a resumed session instead of appending a duplicate", async () => {
    const root = await project()
    expect(appendMemoryEntry(root, entry("ses_resume", "first"))).toBe(true)
    expect(appendMemoryEntry(root, entry("ses_resume", "updated"))).toBe(true)
    const content = await readFile(join(root, ".opencode/memory/2026-01-01.md"), "utf-8")
    expect(content.match(/SessionID: ses_resume/g)).toHaveLength(1)
    expect(content).toContain("updated")
    expect(content).not.toContain("first")
  })

  test("archives summaries atomically and retains full transcripts", async () => {
    const root = await project()
    const sessionID = "ses_archive"
    await mkdir(join(root, ".opencode/memory"), { recursive: true })
    await writeFile(join(root, ".opencode/memory/2020-01-01.md"), `# Memory Log - 2020-01-01\n\n## Session: ses_archive (10:00)\nSessionID: ${sessionID}\nFull transcript: \`.opencode/memory/full/${sessionID}.md\`\n\n**Topic:** archive test\n\n---\n`)
    expect(saveFullTranscript(root, sessionID, [{ role: "user", text: "remember this" }])).toBe(true)
    const result = await archiveOldMemories(root, { archiveAfterDays: 1 })
    expect(result.archived).toEqual(["2020-01-01.md"])
    expect(existsSync(join(root, ".opencode/memory/2020-01-01.md"))).toBe(false)
    expect(await readFile(join(root, ".opencode/MEMORY.md"), "utf-8")).toContain(`SessionID: ${sessionID}`)
    expect(existsSync(getFullTranscriptPath(root, sessionID))).toBe(true)
  })
})
