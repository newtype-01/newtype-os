const TARGET_TOOLS = ["task", "Task", "call_omo_agent", "chief_task"]

const SESSION_ID_PATTERNS = [
  /Session ID: (ses_[a-zA-Z0-9_-]+)/,
  /session_id: (ses_[a-zA-Z0-9_-]+)/,
  /<task_metadata>\s*session_id: (ses_[a-zA-Z0-9_-]+)/,
  /sessionId: (ses_[a-zA-Z0-9_-]+)/,
]

function extractSessionId(output: string): string | null {
  for (const pattern of SESSION_ID_PATTERNS) {
    const match = output.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function createTaskResumeInfoHook() {
  const toolExecuteAfter = async (
    input: { tool: string; sessionID: string; callID: string },
    output: { title: string; output: string; metadata: unknown }
  ) => {
    if (!TARGET_TOOLS.includes(input.tool)) return
    if (
      output.output.startsWith("Error:")
      || output.output.startsWith("Failed")
      || output.output.startsWith("❌")
      || output.output.startsWith("⏳")
      || output.output.startsWith("Task cancelled")
      || output.output.startsWith("Background task launched.")
      || output.output.startsWith("Background task resumed.")
      || output.output.includes("(No text output)")
    ) return
    if (output.output.includes("\nto resume:")) return

    const sessionId = extractSessionId(output.output)
    if (!sessionId) return

    output.output = output.output.trimEnd() + `\n\nto resume: chief_task(resume="${sessionId}", prompt="...")`
  }

  return {
    "tool.execute.after": toolExecuteAfter,
  }
}
