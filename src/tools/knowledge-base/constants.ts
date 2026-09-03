export const TOOL_NAME = "knowledge_base"

export const TOOL_DESCRIPTION = `Progressive disclosure tool for accessing memory and knowledge.

Three actions, from lightweight to detailed:

1. list — Browse all memory entries (dates, tags, summary headlines)
   knowledge_base({ action: "list" })

2. search — Find relevant memories with matching snippets  
   knowledge_base({ action: "search", query: "API design discussion" })

3. get — Retrieve full content of a specific memory entry
   knowledge_base({ action: "get", id: "2026-02-20/ses_abc123" })

Sources: "memory" (default, conversation memories) and "archive" (MEMORY.md plus rotations).
The standalone plugin reads only the current project's .opencode namespace.`
