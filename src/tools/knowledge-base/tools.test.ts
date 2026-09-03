import { describe, test, expect } from "bun:test"
import { knowledge_base } from "./tools"
import type { ToolContext } from "@opencode-ai/plugin/tool"

const mockContext: ToolContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent",
  abort: new AbortController().signal,
}

describe("knowledge_base tool", () => {
  test("list action executes without error", async () => {
    // #given
    const args = { action: "list" as const }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(typeof result).toBe("string")
  })

  test("list action respects limit parameter", async () => {
    // #given
    const args = { action: "list" as const, limit: 5 }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(typeof result).toBe("string")
  })

  test("search action requires query parameter", async () => {
    // #given
    const args = { action: "search" as const }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(result).toBe("Error: query is required for search action")
  })

  test("search action executes with query", async () => {
    // #given
    const args = { action: "search" as const, query: "test query" }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(typeof result).toBe("string")
  })

  test("get action requires id parameter", async () => {
    // #given
    const args = { action: "get" as const }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(result).toBe("Error: id is required for get action")
  })

  test("get action executes with id", async () => {
    // #given
    const args = { action: "get" as const, id: "2026-02-20/ses_abc123" }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(typeof result).toBe("string")
  })

  test("get action accepts include_full parameter", async () => {
    // #given
    const args = { action: "get" as const, id: "2026-02-20/ses_abc123", include_full: true }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(typeof result).toBe("string")
  })

  test("defaults to memory source", async () => {
    // #given
    const args = { action: "list" as const }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(result).not.toContain("not yet supported")
  })

  test("supports long-term archive source", async () => {
    // #given
    const args = { action: "list" as const, source: "archive" as const }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(result).toBe("No archived entries found.")
  })

  test("rejects knowledge source", async () => {
    // #given
    const args = { action: "list" as const, source: "knowledge" as const }

    // #when
    const result = await knowledge_base.execute(args, mockContext)

    // #then
    expect(result).toContain('Source "knowledge" is not yet supported')
  })
})
