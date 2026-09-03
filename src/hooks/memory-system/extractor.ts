import type { MemoryEntry } from "./types"

interface MessagePart {
  type: string
  text?: string
}

interface MessageInfo {
  role: string
  id: string
}

interface MessageWrapper {
  info: MessageInfo
  parts: MessagePart[]
}

const SYSTEM_INSTRUCTION_PATTERNS = [
  /^\[search-mode\]/i,
  /^\[analyze-mode\]/i,
  /^\[write-mode\]/i,
  /^\[edit-mode\]/i,
  /^MAXIMIZE SEARCH EFFORT/i,
  /^ANALYSIS MODE\./i,
  /^chief_task\(/i,
  /^delegate to deputy/i,
]

const SYSTEM_INSTRUCTION_BLOCKS = [
  /^\[search-mode\][\s\S]*?(?=\n\n|$)/i,
  /^\[analyze-mode\][\s\S]*?(?=\n\n|$)/i,
  /^\[write-mode\][\s\S]*?(?=\n\n|$)/i,
  /^\[edit-mode\][\s\S]*?(?=\n\n|$)/i,
  /^MAXIMIZE SEARCH EFFORT[\s\S]*?(?=\n\n|$)/i,
  /^ANALYSIS MODE\.[\s\S]*?(?=\n\n|$)/i,
  /^<command-instruction>[\s\S]*?<\/command-instruction>\s*/i,
  /^<user-request>[\s\S]*?<\/user-request>\s*/i,
]

function extractTextFromParts(parts: MessagePart[]): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n")
}

export function stripSystemInstructionPrefix(text: string): string {
  let result = text.trim()
  
  for (const pattern of SYSTEM_INSTRUCTION_BLOCKS) {
    result = result.replace(pattern, "").trim()
  }
  
  const lines = result.split("\n")
  const cleanedLines: string[] = []
  let foundContent = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!foundContent) {
      if (trimmedLine === "" || trimmedLine === "---") {
        continue
      }
      if (SYSTEM_INSTRUCTION_PATTERNS.some((p) => p.test(trimmedLine))) {
        continue
      }
      if (trimmedLine.startsWith("Deputy will dispatch") ||
          trimmedLine.startsWith("Plus direct tools:") ||
          trimmedLine.startsWith("NEVER stop at first") ||
          trimmedLine.startsWith("SYNTHESIZE")) {
        continue
      }
      foundContent = true
    }
    
    if (foundContent) {
      cleanedLines.push(line)
    }
  }
  
  return cleanedLines.join("\n").trim()
}

/** Filter and prepare messages for LLM summarization */
export function prepareMessagesForSummary(
  messages: MessageWrapper[]
): { role: string; text: string }[] {
  const result: { role: string; text: string }[] = []

  for (const msg of messages) {
    let text = extractTextFromParts(msg.parts)
    if (!text.trim()) continue

    // Strip system instruction prefixes from user messages, keep remaining content
    if (msg.info.role === "user") {
      text = stripSystemInstructionPrefix(text)
      if (!text.trim()) continue
    }

    result.push({
      role: msg.info.role,
      text: text.trim(),
    })
  }

  return result
}

/** Format prepared messages into a transcript string for LLM */
export function formatTranscriptForLLM(
  messages: { role: string; text: string }[]
): string {
  return messages
    .map((m) => `## ${m.role.toUpperCase()}\n${m.text}`)
    .join("\n\n---\n\n")
}

/** Generate the prompt for archivist to create a memory summary */
export function generateSummaryPrompt(transcript: string): string {
  return `将以下对话总结为记忆条目。

规则：
- 只输出 Markdown，不要有其他内容
- 关注：用户的实际问题、达成的结论、做出的决定
- 忽略：系统指令、工具调用细节、中间过程
- 忽略以下系统指令残留（如仍出现在对话中）：[search-mode]、[analyze-mode]、[write-mode]、[edit-mode]、MAXIMIZE SEARCH EFFORT、ANALYSIS MODE、chief_task(...)、delegate to deputy 等
- Topic 必须是对话的实质内容，绝不能是系统指令或模式名称
- 如果对话没有有价值的内容，只返回 "NO_VALUABLE_CONTENT"

输出格式（严格遵循）：
**Topic:** [一句话描述对话主题，要具体，不要太抽象，不能包含系统指令]

**Key Points:**
- [关键要点1，完整表达，不要截断]
- [关键要点2]
- [更多要点如有]

**Decisions:** (如有决定)
- [决定1]

**Tags:** (如有相关标签，用 #tag 格式)
- #tag1
- #tag2

---

对话内容：

${transcript}`
}

const CHATTER_LINE_PATTERNS = [
  /^(好的|收到|明白|了解)[，,。！!]?/,
  /^好[，,][^\n]{0,20}$/,
  /^(以下是|这是|已生成|正在生成)[^\n]{0,40}[:：。]?$/,
  /^记忆库中已有[^\n]*$/,
  /^here('s| is| are)\b[^\n]{0,40}$/i,
  /^(sure|okay|ok)[,.!]?\s/i,
]

export function sanitizeArchivistOutput(text: string): string {
  const lines = text
    .replace(/\*\*QUALITY SCORES:\*\*[\s\S]*?\*\*OVERALL:[^\n]*\n?(\*\*WEAKEST:[^\n]*\n?)?/g, "")
    .replace(/\*\*ARTIFACTS:\*\*\s*```[\s\S]*?(```|$)/g, "")
    .split("\n")
  const start = lines.findIndex((line) => {
    const trimmed = line.trim()
    return trimmed !== "" && trimmed !== "---" && !CHATTER_LINE_PATTERNS.some((pattern) => pattern.test(trimmed))
  })
  if (start === -1) return ""
  return lines
    .slice(start)
    .join("\n")
    .replace(/(\n-{3,}\s*)+$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function looksLikeTranscript(text: string): boolean {
  if (/^# Full Transcript/m.test(text)) return true
  const roleHeadings = text.match(/^##\s+(USER|ASSISTANT|SYSTEM)\b/gm)
  if (roleHeadings && roleHeadings.length >= 2) return true
  const toolUses = text.match(/^\(tool use\)/gm)
  return Boolean(toolUses && toolUses.length >= 3)
}

/** Parse LLM-generated summary into MemoryEntry structure */
export function parseLLMSummary(
  sessionID: string,
  llmOutput: string
): MemoryEntry | null {
  if (!llmOutput || llmOutput.includes("NO_VALUABLE_CONTENT")) {
    return null
  }

  const summary = sanitizeArchivistOutput(llmOutput)
  if (!summary || looksLikeTranscript(summary)) return null

  // Extract tags from the summary
  const tags: string[] = []
  const tagMatches = summary.matchAll(/#([a-zA-Z][\w-]{1,30})/g)
  for (const match of tagMatches) {
    const tag = match[1]?.toLowerCase()
    if (tag) tags.push(`#${tag}`)
  }

  // Extract key points
  const keyPoints: string[] = []
  const keyPointsMatch = summary.match(/\*\*Key Points:\*\*\n([\s\S]*?)(?=\n\*\*|$)/)
  if (keyPointsMatch) {
    const points = keyPointsMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean)
    keyPoints.push(...points)
  }

  // Extract decisions
  const decisions: string[] = []
  const decisionsMatch = summary.match(/\*\*Decisions:\*\*\n([\s\S]*?)(?=\n\*\*|$)/)
  if (decisionsMatch) {
    const items = decisionsMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean)
    decisions.push(...items)
  }

  return {
    sessionID,
    timestamp: new Date().toISOString(),
    summary,
    keyPoints: [...new Set(keyPoints)].slice(0, 10),
    decisions: [...new Set(decisions)].slice(0, 5),
    todos: [],
    tags: [...new Set(tags)].slice(0, 10),
  }
}

/** Fallback: basic extraction when LLM is unavailable */
export function extractSessionSummaryFallback(
  sessionID: string,
  messages: MessageWrapper[]
): MemoryEntry {
  const prepared = prepareMessagesForSummary(messages)

  const userMessages = prepared.filter((m) => m.role === "user").map((m) => m.text)
  const assistantMessages = prepared
    .filter((m) => m.role === "assistant")
    .map((m) => m.text)

  const tags: string[] = []
  for (const m of prepared) {
    const tagMatches = m.text.matchAll(/#([a-zA-Z][\w-]{1,30})/g)
    for (const match of tagMatches) {
      const tag = match[1]?.toLowerCase()
      if (tag) tags.push(`#${tag}`)
    }
  }

  const firstUserMessage = userMessages[0] || ""
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1] || ""

  const truncate = (text: string, max: number) =>
    text.length <= max ? text : text.slice(0, max) + "..."

  const summary = firstUserMessage
    ? `**Topic:** ${truncate(firstUserMessage, 500)}`
    : "No summary available"

  const keyPoints: string[] = []
  if (firstUserMessage) {
    keyPoints.push(`User asked: ${truncate(firstUserMessage, 300)}`)
  }
  if (lastAssistantMessage) {
    keyPoints.push(`Response: ${truncate(lastAssistantMessage, 300)}`)
  }

  return {
    sessionID,
    timestamp: new Date().toISOString(),
    summary,
    keyPoints,
    decisions: [],
    todos: [],
    tags: [...new Set(tags)].slice(0, 10),
  }
}
