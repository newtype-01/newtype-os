import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { getLongTermMemoryContext, getRecentMemoryContext } from "./recall"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("plugin memory recall", () => {
  test("ranks Chinese matches and ignores .newtype", async () => {
    const root = await mkdtemp(join(tmpdir(), "opencode-recall-"))
    roots.push(root)
    await mkdir(join(root, ".opencode/memory"), { recursive: true })
    await mkdir(join(root, ".newtype/memory"), { recursive: true })
    await writeFile(join(root, ".opencode/memory/2026-02-12.md"), "# Memory Log - 2026-02-12\n\n## Session: ses_plugin (10:00)\nSessionID: ses_plugin\n\n**Topic:** 文件系统作为企业治理模型的可行性分析\n\n---\n")
    await writeFile(join(root, ".newtype/memory/2026-02-13.md"), "# Memory Log - 2026-02-13\n\n## Session: ses_newtype (10:00)\nSessionID: ses_newtype\n\n**Topic:** 整合版私有记忆\n\n---\n")
    const result = getRecentMemoryContext(root, "文件系统治理")
    expect(result).toContain("文件系统作为企业治理")
    expect(result).not.toContain("整合版私有")
  })

  test("recalls every long-term rotation", async () => {
    const root = await mkdtemp(join(tmpdir(), "opencode-recall-"))
    roots.push(root)
    await mkdir(join(root, ".opencode"), { recursive: true })
    await writeFile(join(root, ".opencode/MEMORY.1.md"), "# Long-term Memory\n\n### From 2026-02-12\n\n## Session: ses_rotated (10:00)\nSessionID: ses_rotated\n\n**Topic:** 量子力学观察者效应与主观现实的区别\n\n---\n")
    expect(getLongTermMemoryContext(root, "量子力学观察者")).toContain("量子力学观察者效应")
  })
})
