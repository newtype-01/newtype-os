import { describe, expect, test } from "bun:test"
import { createSessionTools } from "./live-tools"

describe("runtime session tools", () => {
  test("reads message text from the runtime API", async () => {
    const client = {
      session: {
        messages: async () => ({
          data: [
            {
              info: { id: "msg_source", role: "user", agent: "chief", time: { created: 1 } },
              parts: [{ type: "text", text: "Exact source manuscript" }],
            },
          ],
        }),
        todo: async () => ({ data: [] }),
      },
    }
    const tools = createSessionTools(client as never, "/workspace")

    const result = await tools.session_read.execute({ session_id: "ses_source", include_todos: false }, {
      sessionID: "ses_caller",
      messageID: "msg_caller",
      agent: "deputy",
      abort: new AbortController().signal,
    } as never)

    expect(result).toContain("Exact source manuscript")
    expect(result).toContain("chief")
  })

  test("reports runtime lookup errors instead of falling back to stale files", async () => {
    const client = {
      session: {
        messages: async () => ({ data: undefined, error: "not found" }),
      },
    }
    const tools = createSessionTools(client as never, "/workspace")

    const result = await tools.session_read.execute({ session_id: "ses_missing" }, {
      sessionID: "ses_caller",
      messageID: "msg_caller",
      agent: "deputy",
      abort: new AbortController().signal,
    } as never)

    expect(result).toBe("Error: not found")
  })
})
