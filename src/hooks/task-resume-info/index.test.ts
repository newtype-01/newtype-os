import { describe, expect, test } from "bun:test"
import { createTaskResumeInfoHook } from "./index"

describe("task resume info", () => {
  test("does not suggest resuming a task that is still running", async () => {
    const hook = createTaskResumeInfoHook()
    const output = {
      title: "",
      output: "⏳ Task is still running after 10m.\n\nSession ID: ses_running",
      metadata: undefined,
    }

    await hook["tool.execute.after"]({ tool: "chief_task", sessionID: "ses_parent", callID: "call" }, output)

    expect(output.output).not.toContain("to resume:")
  })

  test("does not suggest resuming a newly launched background task", async () => {
    const hook = createTaskResumeInfoHook()
    const output = {
      title: "",
      output: "Background task launched.\n\nSession ID: ses_running",
      metadata: undefined,
    }

    await hook["tool.execute.after"]({ tool: "chief_task", sessionID: "ses_parent", callID: "call" }, output)

    expect(output.output).not.toContain("to resume:")
  })

  test("adds resume information to a completed task", async () => {
    const hook = createTaskResumeInfoHook()
    const output = {
      title: "",
      output: "Task completed.\n\nSession ID: ses_complete\n\n---\n\nResult",
      metadata: undefined,
    }

    await hook["tool.execute.after"]({ tool: "chief_task", sessionID: "ses_parent", callID: "call" }, output)

    expect(output.output).toContain('chief_task(resume="ses_complete"')
  })
})
