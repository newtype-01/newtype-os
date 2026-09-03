import { afterEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { auditMemory } from "./audit"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("plugin memory audit", () => {
  test("repairs duplicates and links without touching .newtype", async () => {
    const root = await mkdtemp(join(tmpdir(), "opencode-memory-audit-"))
    roots.push(root)
    await mkdir(join(root, ".opencode/memory"), { recursive: true })
    const block = "## Session: ses_audit (10:00)\nSessionID: ses_audit\nFull transcript: `.newtype/memory/full/ses_audit.md`\n\n**Topic:** audit\n\n---\n"
    await writeFile(join(root, ".opencode/memory/2026-01-01.md"), `# Memory Log - 2026-01-01\n\n${block}`)
    await writeFile(join(root, ".opencode/memory/2026-01-02.md"), `# Memory Log - 2026-01-02\n\n${block}`)
    const before = auditMemory(root)
    expect(before.duplicate_sessions).toEqual(["ses_audit"])
    expect(before.broken_links).toEqual(["ses_audit"])
    const after = auditMemory(root, { apply: true })
    expect(after.duplicate_sessions).toEqual([])
    expect(after.broken_links).toEqual([])
    expect(after.index_valid).toBe(true)
    expect(after.repaired).toBe(2)
    expect(await readFile(join(root, ".opencode/memory/2026-01-02.md"), "utf-8")).toContain(".opencode/memory/full/ses_audit.md")
    expect(existsSync(join(root, ".newtype"))).toBe(false)
  })
})
