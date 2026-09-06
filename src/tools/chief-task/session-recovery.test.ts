import { describe, expect, test } from "bun:test"
import { createChiefTask } from "./tools"

describe("chief task session recovery", () => {
  test("resumes with the original agent and request-specific result", async () => {
    let submittedID = ""
    let submittedAgent = ""
    const client = {
      session: {
        get: async () => ({ data: { id: "parent-session" } }),
        status: async () => ({ data: {} }),
        abort: async () => ({ data: true }),
        promptAsync: async (input: { body: { messageID: string; agent: string } }) => {
          submittedID = input.body.messageID
          submittedAgent = input.body.agent
          return { data: {} }
        },
        messages: async () => ({
          data: [
            {
              info: {
                role: "user",
                agent: "researcher",
                model: { providerID: "openai", modelID: "test-model" },
                time: { created: 1 },
              },
              parts: [{ type: "text", text: "Original task" }],
            },
            {
              info: { role: "assistant", parentID: submittedID, time: { created: 2 } },
              parts: [{ type: "text", text: "Resumed result" }],
            },
          ],
        }),
      },
    }
    const chiefTask = createChiefTask({
      manager: {},
      client,
      pollIntervalMs: 1,
    } as never)

    const result = await chiefTask.execute(
      {
        description: "Resume",
        prompt: "Continue",
        resume: "target-session",
        run_in_background: false,
        skills: [],
      },
      { sessionID: "parent-session", messageID: "parent-message", agent: "chief", abort: new AbortController().signal },
    )

    expect(result).toContain("Resumed result")
    expect(submittedAgent).toBe("researcher")
  })

  test("blocks a child session from resuming its ancestor", async () => {
    let prompted = false
    const client = {
      session: {
        get: async ({ path }: { path: { id: string } }) => ({
          data: { id: path.id, parentID: path.id === "child-session" ? "parent-session" : undefined },
        }),
        promptAsync: async () => {
          prompted = true
          return { data: {} }
        },
      },
    }
    const chiefTask = createChiefTask({ manager: {}, client } as never)

    const result = await chiefTask.execute(
      {
        description: "Resume parent",
        prompt: "Continue",
        resume: "parent-session",
        run_in_background: false,
        skills: [],
      },
      { sessionID: "child-session", messageID: "message", agent: "deputy", abort: new AbortController().signal },
    )

    expect(result).toContain("cannot resume an ancestor")
    expect(prompted).toBe(false)
  })

  test("stops a child when the wait times out", async () => {
    let statusChecks = 0
    let aborted = ""
    const client = {
      session: {
        get: async () => ({ data: { id: "caller" } }),
        status: async () => ({ data: statusChecks++ === 0 ? {} : { target: { type: "busy" } } }),
        abort: async ({ path }: { path: { id: string } }) => {
          aborted = path.id
          return { data: true }
        },
        promptAsync: async () => ({ data: {} }),
        messages: async () => ({
          data: [{
            info: {
              role: "user",
              agent: "editor",
              model: { providerID: "openai", modelID: "test-model" },
              time: { created: 1 },
            },
            parts: [{ type: "text", text: "Original task" }],
          }],
        }),
      },
    }
    const chiefTask = createChiefTask({
      manager: {},
      client,
      maxWaitMs: 3,
      pollIntervalMs: 1,
    } as never)

    const result = await chiefTask.execute(
      {
        description: "Slow task",
        prompt: "Continue",
        resume: "target",
        run_in_background: false,
        skills: [],
      },
      { sessionID: "caller", messageID: "message", agent: "chief", abort: new AbortController().signal },
    )

    expect(result).toContain("time limit and was stopped")
    expect(result).not.toContain("completed")
    expect(aborted).toBe("target")
  })
})
