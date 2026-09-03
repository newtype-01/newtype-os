import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { TOOL_DESCRIPTION } from "./constants"
import { listMemoryEntries, searchMemoryEntries, getMemoryEntry } from "./memory-source"
import { getArchiveEntry, listArchiveEntries, searchArchiveEntries } from "./archive-source"
import type { KnowledgeBaseArgs } from "./types"

export const knowledge_base: ToolDefinition = tool({
  description: TOOL_DESCRIPTION,
  args: {
    action: tool.schema.enum(["list", "search", "get"]).describe("Action: list (browse), search (find), get (retrieve full)"),
    source: tool.schema.enum(["memory", "archive", "knowledge"]).optional().describe("Data source (default: memory)"),
    query: tool.schema.string().optional().describe("Search query (required for search action)"),
    id: tool.schema.string().optional().describe("Entry ID in format YYYY-MM-DD/sessionID (required for get action)"),
    limit: tool.schema.number().optional().describe("Max results to return (default: 20 for list, 10 for search)"),
    include_full: tool.schema.boolean().optional().describe("Include full transcript in get results (default: false)"),
  },
  execute: async (args: KnowledgeBaseArgs, _context) => {
    try {
      const source = args.source ?? "memory"
      const projectDir = process.cwd()

      if (source === "archive") {
        switch (args.action) {
          case "list":
            return listArchiveEntries(projectDir, args.limit)
          case "search":
            if (!args.query) return "Error: query is required for search action"
            return searchArchiveEntries(projectDir, args.query, args.limit)
          case "get":
            if (!args.id) return "Error: id is required for get action"
            return getArchiveEntry(projectDir, args.id)
          default:
            return `Unknown action: ${args.action}. Available: list, search, get`
        }
      }

      if (source !== "memory") {
        return `Source "${source}" is not yet supported. Currently available: memory, archive`
      }

      switch (args.action) {
        case "list":
          return listMemoryEntries(projectDir, args.limit)
        case "search":
          if (!args.query) return "Error: query is required for search action"
          return searchMemoryEntries(projectDir, args.query, args.limit)
        case "get":
          if (!args.id) return "Error: id is required for get action"
          return getMemoryEntry(projectDir, args.id, args.include_full)
        default:
          return `Unknown action: ${args.action}. Available: list, search, get`
      }
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})
