import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import type { SessionInfoArgs, SessionListArgs, SessionReadArgs, SessionSearchArgs } from "./types"

type OpencodeClient = PluginInput["client"]

type RuntimeSession = {
  id: string
  title?: string
  directory?: string
  parentID?: string
  time?: { created?: number; updated?: number }
}
type RuntimeMessage = {
  info?: {
    id?: string
    role?: string
    agent?: string
    time?: { created?: number }
  }
  parts?: Array<{
    type?: string
    text?: string
    tool?: string
    state?: { input?: unknown; output?: string; error?: string }
  }>
}

export function createSessionTools(client: OpencodeClient, defaultDirectory: string): Record<string, ToolDefinition> {
  return {
    session_list: tool({
      description: "List current newtype sessions from the runtime session store.",
      args: {
        limit: tool.schema.number().optional(),
        from_date: tool.schema.string().optional(),
        to_date: tool.schema.string().optional(),
        project_path: tool.schema.string().optional(),
      },
      execute: async (args: SessionListArgs) => {
        const result = await client.session.list({ query: { directory: args.project_path ?? defaultDirectory } })
        if (result.error) return `Error: ${String(result.error)}`

        const from = args.from_date ? new Date(args.from_date).getTime() : undefined
        const to = args.to_date ? new Date(args.to_date).getTime() : undefined
        const sessions = (result.data as RuntimeSession[])
          .filter((session) => !session.parentID)
          .filter((session) => from === undefined || (session.time?.updated ?? 0) >= from)
          .filter((session) => to === undefined || (session.time?.updated ?? 0) <= to)
          .sort((a, b) => (b.time?.updated ?? 0) - (a.time?.updated ?? 0))
          .slice(0, args.limit && args.limit > 0 ? args.limit : undefined)
        if (!sessions.length) return "No sessions found."

        return [
          "| Session ID | Title | Updated | Directory |",
          "|---|---|---|---|",
          ...sessions.map((session) =>
            [
              "|",
              escapeCell(session.id),
              "|",
              escapeCell(session.title ?? "Untitled"),
              "|",
              session.time?.updated ? new Date(session.time.updated).toISOString() : "N/A",
              "|",
              escapeCell(session.directory ?? "N/A"),
              "|",
            ].join(" "),
          ),
        ].join("\n")
      },
    }),
    session_read: tool({
      description: "Read a current newtype session from the runtime session store.",
      args: {
        session_id: tool.schema.string(),
        include_todos: tool.schema.boolean().optional(),
        include_transcript: tool.schema.boolean().optional(),
        limit: tool.schema.number().optional(),
      },
      execute: async (args: SessionReadArgs) => {
        const messagesResult = await client.session.messages({ path: { id: args.session_id } })
        if (messagesResult.error) return `Error: ${String(messagesResult.error)}`

        const messages = (messagesResult.data as RuntimeMessage[])
          .sort((a, b) => (a.info?.time?.created ?? 0) - (b.info?.time?.created ?? 0))
          .slice(0, args.limit && args.limit > 0 ? args.limit : undefined)
        const todos = args.include_todos ? await client.session.todo({ path: { id: args.session_id } }) : undefined
        if (todos?.error) return `Error: ${String(todos.error)}`

        return formatMessages(messages, todos?.data)
      },
    }),
    session_search: tool({
      description: "Search current newtype session messages from the runtime session store.",
      args: {
        query: tool.schema.string(),
        session_id: tool.schema.string().optional(),
        case_sensitive: tool.schema.boolean().optional(),
        limit: tool.schema.number().optional(),
      },
      execute: async (args: SessionSearchArgs) => {
        const sessionIDs = args.session_id ? [args.session_id] : await listSessionIDs(client, defaultDirectory)
        if (!Array.isArray(sessionIDs)) return sessionIDs.error

        const limit = args.limit && args.limit > 0 ? args.limit : 20
        const query = args.case_sensitive ? args.query : args.query.toLowerCase()
        const results: string[] = []
        for (const sessionID of sessionIDs.slice(0, 50)) {
          if (results.length >= limit) break
          const messagesResult = await client.session.messages({ path: { id: sessionID } })
          if (messagesResult.error) {
            if (args.session_id) return `Error: ${String(messagesResult.error)}`
            continue
          }

          for (const message of messagesResult.data as RuntimeMessage[]) {
            if (results.length >= limit) break
            const text =
              message.parts
                ?.filter((part) => part.type === "text")
                .map((part) => part.text ?? "")
                .join("\n") ?? ""
            const searchable = args.case_sensitive ? text : text.toLowerCase()
            const index = searchable.indexOf(query)
            if (index < 0) continue
            const start = Math.max(0, index - 80)
            const end = Math.min(text.length, index + args.query.length + 80)
            results.push(
              `[${sessionID}] ${message.info?.id ?? "unknown"} (${message.info?.role ?? "unknown"})\n  ${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`,
            )
          }
        }
        return results.length ? `Found ${results.length} matches:\n\n${results.join("\n\n")}` : "No matches found."
      },
    }),
    session_info: tool({
      description: "Show current newtype session metadata from the runtime session store.",
      args: { session_id: tool.schema.string() },
      execute: async (args: SessionInfoArgs) => {
        const [sessionResult, messagesResult, todoResult] = await Promise.all([
          client.session.get({ path: { id: args.session_id } }),
          client.session.messages({ path: { id: args.session_id } }),
          client.session.todo({ path: { id: args.session_id } }),
        ])
        if (sessionResult.error) return `Error: ${String(sessionResult.error)}`
        if (messagesResult.error) return `Error: ${String(messagesResult.error)}`
        if (todoResult.error) return `Error: ${String(todoResult.error)}`

        const session = sessionResult.data as RuntimeSession
        const agents = [
          ...new Set(
            (messagesResult.data as RuntimeMessage[]).flatMap((message) =>
              message.info?.agent ? [message.info.agent] : [],
            ),
          ),
        ]
        return [
          `Session ID: ${session.id}`,
          `Title: ${session.title ?? "Untitled"}`,
          `Directory: ${session.directory ?? "N/A"}`,
          `Parent: ${session.parentID ?? "none"}`,
          `Messages: ${messagesResult.data.length}`,
          `Agents Used: ${agents.join(", ") || "none"}`,
          `Todos: ${todoResult.data.length}`,
          `Updated: ${session.time?.updated ? new Date(session.time.updated).toISOString() : "N/A"}`,
        ].join("\n")
      },
    }),
  }
}

async function listSessionIDs(client: OpencodeClient, directory: string) {
  const result = await client.session.list({ query: { directory } })
  if (result.error) return { error: `Error: ${String(result.error)}` }
  return (result.data as RuntimeSession[])
    .sort((a, b) => (b.time?.updated ?? 0) - (a.time?.updated ?? 0))
    .map((session) => session.id)
}

function formatMessages(messages: RuntimeMessage[], todos?: Array<{ content?: string; status?: string }>) {
  if (!messages.length) return "No messages found in this session."
  const output = messages.flatMap((message) => {
    const header = `[${message.info?.role ?? "unknown"}${message.info?.agent ? ` (${message.info.agent})` : ""}] ${message.info?.time?.created ? new Date(message.info.time.created).toISOString() : "Unknown time"}`
    const parts =
      message.parts?.flatMap((part) => {
        if (part.type === "text" && part.text) return [part.text.trim()]
        if (part.type === "tool" && part.tool)
          return [`[tool: ${part.tool}] ${JSON.stringify(part.state?.input ?? {}).slice(0, 200)}`]
        return []
      }) ?? []
    return [header, ...parts, ""]
  })
  if (todos?.length) {
    output.push("=== Todos ===", ...todos.map((todo) => `- [${todo.status ?? "pending"}] ${todo.content ?? ""}`))
  }
  return output.join("\n").trim()
}

function escapeCell(value: string) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ")
}
