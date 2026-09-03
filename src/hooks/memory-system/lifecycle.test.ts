import { afterEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { PluginInput } from "@opencode-ai/plugin"
import { createMemorySystemHook } from "."

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

function messages(topic: string) {
  return [
    { info: { id: "user-1", role: "user" }, parts: [{ type: "text", text: `请处理 ${topic}，保存完整过程和关键决定。` }] },
    { info: { id: "assistant-1", role: "assistant" }, parts: [{ type: "text", text: `${topic} 已完成，并记录了验证结果。` }] },
  ]
}

describe("memory system lifecycle", () => {
  test("persists every root session immediately and updates resumed content", async () => {
    const root = await mkdtemp(join(tmpdir(), "opencode-memory-hook-"))
    roots.push(root)
    const content = new Map([["ses_first", messages("第一版")], ["ses_second", messages("第二个会话")]])
    const client = {
      session: {
        messages: async ({ path }: { path: { id: string } }) => ({ data: content.get(path.id) ?? [] }),
        create: async () => ({ error: { message: "offline" } }),
        get: async ({ path }: { path: { id: string } }) => ({ data: { id: path.id } }),
      },
    }
    const hook = createMemorySystemHook({ directory: root, client } as unknown as PluginInput)
    await hook.event({ event: { type: "session.created", properties: { info: { id: "ses_first" } } } })
    await hook.event({ event: { type: "session.created", properties: { info: { id: "ses_second" } } } })
    await hook.event({ event: { type: "session.idle", properties: { sessionID: "ses_first" } } })
    await hook.event({ event: { type: "session.idle", properties: { sessionID: "ses_second" } } })
    expect(existsSync(join(root, ".opencode/memory/full/ses_first.md"))).toBe(true)
    expect(existsSync(join(root, ".opencode/memory/full/ses_second.md"))).toBe(true)
    content.set("ses_first", messages("恢复后的新版"))
    await hook.event({ event: { type: "session.idle", properties: { sessionID: "ses_first" } } })
    await hook.dispose()
    expect(await readFile(join(root, ".opencode/memory/full/ses_first.md"), "utf-8")).toContain("恢复后的新版")
    const dailyFile = (await readdir(join(root, ".opencode/memory"))).find((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))!
    expect((await readFile(join(root, ".opencode/memory", dailyFile), "utf-8")).match(/SessionID: ses_first/g)).toHaveLength(1)
    expect(existsSync(join(root, ".newtype"))).toBe(false)
  })

  test("never stores child sessions", async () => {
    const root = await mkdtemp(join(tmpdir(), "opencode-memory-hook-"))
    roots.push(root)
    const client = {
      session: {
        messages: async () => ({ data: messages("child") }),
        create: async () => ({ error: { message: "offline" } }),
        get: async () => ({ data: { parentID: "ses_parent" } }),
      },
    }
    const hook = createMemorySystemHook({ directory: root, client } as unknown as PluginInput)
    await hook.event({ event: { type: "session.created", properties: { info: { id: "ses_child", parentID: "ses_parent" } } } })
    await hook.event({ event: { type: "session.idle", properties: { sessionID: "ses_child" } } })
    expect(existsSync(join(root, ".opencode/memory/full/ses_child.md"))).toBe(false)
  })
})
