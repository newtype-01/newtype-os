import { describe, expect, test } from "bun:test"
import { BackgroundManager } from "./manager"

describe("BackgroundManager resume guard", () => {
  test("rejects resuming a task that is already running", async () => {
    const manager = new BackgroundManager({ client: {}, directory: "/tmp/project" } as never)
    manager.registerExternalTask({
      taskId: "running-task",
      sessionID: "running-session",
      parentSessionID: "parent-session",
      description: "Already running",
    })

    await expect(manager.resume({
      sessionId: "running-session",
      prompt: "Continue",
      parentSessionID: "parent-session",
      parentMessageID: "parent-message",
    })).rejects.toThrow("already running")
    manager.cleanup()
  })

  test("preserves the original model and system content on resume", async () => {
    const prompts: Array<{ agent?: string; system?: string; model?: { providerID: string; modelID: string } }> = []
    const manager = new BackgroundManager({
      directory: "/tmp/project",
      client: {
        session: {
          create: async () => ({ data: { id: "background-session" } }),
          promptAsync: async ({ body }: { body: typeof prompts[number] }) => {
            prompts.push(body)
            return { data: {} }
          },
        },
      },
    } as never)
    const task = await manager.launch({
      description: "Draft",
      prompt: "Start",
      agent: "writer",
      parentSessionID: "parent-session",
      parentMessageID: "parent-message",
      model: { providerID: "openai", modelID: "writer-model" },
      skillContent: "Writer system context",
    })
    task.status = "completed"

    await manager.resume({
      sessionId: task.sessionID,
      prompt: "Continue",
      parentSessionID: "parent-session",
      parentMessageID: "next-message",
    })

    expect(prompts[1]?.agent).toBe("writer")
    expect(prompts[1]?.model).toEqual({ providerID: "openai", modelID: "writer-model" })
    expect(prompts[1]?.system).toBe("Writer system context")
    manager.cleanup()
  })
})
