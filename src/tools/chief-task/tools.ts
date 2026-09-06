import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import type { BackgroundManager } from "../../features/background-agent"
import type { ChiefTaskArgs } from "./types"
import type { CategoryConfig, CategoriesConfig, TaskCircuitBreakerConfig } from "../../config/schema"
import { CHIEF_TASK_DESCRIPTION, DEFAULT_CATEGORIES, CATEGORY_PROMPT_APPENDS, AGENT_TO_CATEGORY_MAP } from "./constants"
import { findNearestMessageWithFields, MESSAGE_STORAGE } from "../../features/hook-message-injector"
import { resolveMultipleSkills } from "../../features/opencode-skill-loader/skill-content"
import { createBuiltinSkills } from "../../features/builtin-skills/skills"
import { getTaskToastManager } from "../../features/task-toast-manager"
import { subagentSessions } from "../../features/claude-code-session-state"
import { analyzeQualityForRetry, formatFinalOutput, MAX_REWRITE_ATTEMPTS } from "./quality-feedback"
import { log } from "../../shared/logger"
import { createTaskGuard } from "./task-guard"
import { createSessionWaitGraph } from "./wait-graph"

type OpencodeClient = PluginInput["client"]

const DEPUTY_AGENT = "deputy"
const CATEGORY_EXAMPLES = Object.keys(DEFAULT_CATEGORIES).map(k => `'${k}'`).join(", ")
const DEFAULT_POLL_INTERVAL_MS = 500
const DEFAULT_MAX_WAIT_MS = 10 * 60 * 1000
const LOG_PREFIX = "[chief-task]"

function parseModelString(model: string): { providerID: string; modelID: string } | undefined {
  const parts = model.split("/")
  if (parts.length >= 2) {
    return { providerID: parts[0], modelID: parts.slice(1).join("/") }
  }
  return undefined
}

function getMessageDir(sessionID: string): string | null {
  if (!existsSync(MESSAGE_STORAGE)) return null

  const directPath = join(MESSAGE_STORAGE, sessionID)
  if (existsSync(directPath)) return directPath

  for (const dir of readdirSync(MESSAGE_STORAGE)) {
    const sessionPath = join(MESSAGE_STORAGE, dir, sessionID)
    if (existsSync(sessionPath)) return sessionPath
  }

  return null
}

function formatDuration(start: Date, end?: Date): string {
  const duration = (end ?? new Date()).getTime() - start.getTime()
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

type ToolContextWithMetadata = {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void
}

type WaitResult =
  | { status: "idle" }
  | { status: "timeout" }
  | { status: "aborted" }
  | { status: "error"; error: string }

async function waitForSessionIdle(
  client: OpencodeClient,
  sessionID: string,
  messageID: string,
  abort: AbortSignal,
  maxWaitMs: number,
  pollIntervalMs: number,
): Promise<WaitResult> {
  const stop = () => client.session.abort({ path: { id: sessionID } }).catch(() => {})
  const onAbort = () => {
    void stop()
  }
  if (abort.aborted) {
    onAbort()
    return { status: "aborted" }
  }
  abort.addEventListener("abort", onAbort, { once: true })

  try {
    const started = Date.now()
    while (Date.now() - started < maxWaitMs) {
      if (abort.aborted) return { status: "aborted" }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      if (abort.aborted) return { status: "aborted" }

      try {
        const statusResult = await client.session.status()
        if (statusResult.error) {
          await stop()
          return { status: "error", error: String(statusResult.error) }
        }

        const allStatuses = (statusResult.data ?? {}) as Record<string, { type: string }>
        const sessionStatus = allStatuses[sessionID]
        if (!sessionStatus || sessionStatus.type === "idle") {
          const messagesResult = await client.session.messages({ path: { id: sessionID } })
          if (messagesResult.error) {
            await stop()
            return { status: "error", error: String(messagesResult.error) }
          }
          const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as SessionMessage[]
          if (messages.some((message) => message.info?.role === "assistant" && message.info.parentID === messageID)) {
            return { status: "idle" }
          }
        }
      } catch (error) {
        await stop()
        return { status: "error", error: error instanceof Error ? error.message : String(error) }
      }
    }
    await stop()
    return { status: "timeout" }
  } finally {
    abort.removeEventListener("abort", onAbort)
  }
}

type SessionMessage = {
  info?: {
    role?: string
    parentID?: string
    agent?: string
    model?: { providerID?: string; modelID?: string }
    system?: string
    tools?: Record<string, boolean>
    error?: { name?: string; data?: { message?: string } }
    time?: { created?: number; completed?: number }
  }
  parts?: Array<{ type?: string; text?: string }>
}

async function getAssistantMessage(
  client: OpencodeClient,
  sessionID: string,
  parentID: string,
): Promise<{ text: string; error?: string }> {
  const messagesResult = await client.session.messages({ path: { id: sessionID } })

  if (messagesResult.error) {
    return { text: "", error: String(messagesResult.error) }
  }

  const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as SessionMessage[]
  const assistantMessage = messages
    .filter((message) => message.info?.role === "assistant" && message.info.parentID === parentID)
    .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
    .at(0)

  if (!assistantMessage) return { text: "", error: "No assistant response found for this task request" }
  if (assistantMessage.info?.error) {
    return {
      text: "",
      error: assistantMessage.info.error.data?.message ?? assistantMessage.info.error.name ?? "Assistant response failed",
    }
  }

  const textParts = assistantMessage.parts?.filter((part) => part.type === "text") ?? []
  const textContent = textParts.map((p) => p.text ?? "").filter(Boolean).join("\n")
  if (!textContent.trim()) return { text: "", error: "Task completed without text output" }
  return { text: textContent }
}

async function getResumeIdentity(client: OpencodeClient, sessionID: string) {
  let messagesResult
  try {
    messagesResult = await client.session.messages({ path: { id: sessionID } })
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
  if (messagesResult.error) return { error: String(messagesResult.error) }

  const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as SessionMessage[]
  const firstUser = messages
    .filter((message) => message.info?.role === "user")
    .sort((a, b) => (a.info?.time?.created ?? 0) - (b.info?.time?.created ?? 0))
    .at(0)
  if (!firstUser?.info?.agent || !firstUser.info.model?.providerID || !firstUser.info.model.modelID) {
    return { error: "Original agent and model could not be determined" }
  }

  return {
    agent: firstUser.info.agent,
    model: {
      providerID: firstUser.info.model.providerID,
      modelID: firstUser.info.model.modelID,
    },
    system: firstUser.info.system,
    tools: firstUser.info.tools,
  }
}

async function validateResumeTarget(client: OpencodeClient, caller: string, target: string) {
  if (caller === target) {
    return `❌ Task resume blocked: session ${caller} cannot resume itself.`
  }

  const chain = [caller]
  let current: string | undefined = caller
  for (let depth = 0; current && depth < 64; depth++) {
    try {
      const sessionResult: { data?: { parentID?: string }; error?: unknown } = await client.session.get({ path: { id: current } })
      if (sessionResult.error) {
        return `❌ Task resume blocked: could not verify the target session lineage: ${String(sessionResult.error)}`
      }
      current = sessionResult.data?.parentID
    } catch (error) {
      return `❌ Task resume blocked: could not verify the target session lineage: ${error instanceof Error ? error.message : String(error)}`
    }
    if (!current) return
    chain.push(current)
    if (current === target) {
      return [
        "❌ Task resume blocked: a child session cannot resume an ancestor session.",
        "",
        `Session chain: ${chain.join(" -> ")}`,
        "Return the current result to the caller instead.",
      ].join("\n")
    }
  }

  if (current) return "❌ Task resume blocked: session lineage exceeded the supported depth."
}

async function validateResumeTargetIdle(client: OpencodeClient, target: string) {
  try {
    const statusResult = await client.session.status()
    if (statusResult.error) return `❌ Task resume blocked: could not read session status: ${String(statusResult.error)}`
    const statuses = (statusResult.data ?? {}) as Record<string, { type: string }>
    if (statuses[target] && statuses[target].type !== "idle") {
      return `❌ Task resume blocked: session ${target} is already running (${statuses[target].type}). Check its existing execution before resuming it again.`
    }
  } catch (error) {
    return `❌ Task resume blocked: could not read session status: ${error instanceof Error ? error.message : String(error)}`
  }
}

function requestMessageID() {
  return `msg_${crypto.randomUUID()}`
}

function resolveCategoryConfig(
  categoryName: string,
  userCategories?: CategoriesConfig
): { config: CategoryConfig; promptAppend: string } | null {
  const defaultConfig = DEFAULT_CATEGORIES[categoryName]
  const userConfig = userCategories?.[categoryName]
  const defaultPromptAppend = CATEGORY_PROMPT_APPENDS[categoryName] ?? ""

  if (!defaultConfig && !userConfig) {
    return null
  }

  const config: CategoryConfig = {
    ...defaultConfig,
    ...userConfig,
    model: userConfig?.model ?? defaultConfig?.model,
  }

  let promptAppend = defaultPromptAppend
  if (userConfig?.prompt_append) {
    promptAppend = defaultPromptAppend
      ? defaultPromptAppend + "\n\n" + userConfig.prompt_append
      : userConfig.prompt_append
  }

  return { config, promptAppend }
}

export interface AgentModelConfig {
  model?: string
}

export interface ChiefTaskToolOptions {
  manager: BackgroundManager
  client: OpencodeClient
  userCategories?: CategoriesConfig
  agentModels?: Record<string, AgentModelConfig>
  taskCircuitBreaker?: TaskCircuitBreakerConfig
  maxWaitMs?: number
  pollIntervalMs?: number
}

export interface BuildSystemContentInput {
  skillContent?: string
  categoryPromptAppend?: string
}

export function buildSystemContent(input: BuildSystemContentInput): string | undefined {
  const { skillContent, categoryPromptAppend } = input

  if (!skillContent && !categoryPromptAppend) {
    return undefined
  }

  if (skillContent && categoryPromptAppend) {
    return `${skillContent}\n\n${categoryPromptAppend}`
  }

  return skillContent || categoryPromptAppend
}

export function createChiefTask(options: ChiefTaskToolOptions): ToolDefinition {
  const { manager, client, userCategories, agentModels } = options
  const guard = createTaskGuard(options.taskCircuitBreaker)
  const waits = createSessionWaitGraph()
  const maxWaitMs = options.maxWaitMs ?? DEFAULT_MAX_WAIT_MS
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS

  return tool({
    description: CHIEF_TASK_DESCRIPTION,
    args: {
      description: tool.schema.string().describe("Short task description"),
      prompt: tool.schema.string().describe("Full detailed prompt for the agent"),
      category: tool.schema.string().optional().describe(`Category name (e.g., ${CATEGORY_EXAMPLES}). Mutually exclusive with subagent_type.`),
      subagent_type: tool.schema.string().optional().describe("Agent name directly (e.g., 'researcher', 'writer'). Mutually exclusive with category."),
      run_in_background: tool.schema.boolean().describe("Run in background. MUST be explicitly set. Use false for task delegation, true for parallel research."),
      resume: tool.schema.string().optional().describe("Session ID to resume - continues previous agent session with full context"),
      skills: tool.schema.array(tool.schema.string()).describe("Array of skill names to prepend to the prompt. Use [] if no skills needed."),
    },
    async execute(args: ChiefTaskArgs, toolContext) {
      const ctx = toolContext as ToolContextWithMetadata
      if (args.run_in_background === undefined) {
        return `❌ Invalid arguments: 'run_in_background' parameter is REQUIRED. Use run_in_background=false for task delegation, run_in_background=true for parallel research.`
      }
      if (args.skills === undefined) {
        return `❌ Invalid arguments: 'skills' parameter is REQUIRED. Use skills=[] if no skills needed.`
      }
      const runInBackground = args.run_in_background === true

      let skillContent: string | undefined
      if (args.skills.length > 0) {
        const { resolved, notFound } = resolveMultipleSkills(args.skills)
        if (notFound.length > 0) {
          const available = createBuiltinSkills().map(s => s.name).join(", ")
          return `❌ Skills not found: ${notFound.join(", ")}. Available: ${available}`
        }
        skillContent = Array.from(resolved.values()).join("\n\n")
      }

      const messageDir = getMessageDir(ctx.sessionID)
      const prevMessage = messageDir ? findNearestMessageWithFields(messageDir) : null
      const parentAgent = ctx.agent ?? prevMessage?.agent
      const parentModel = prevMessage?.model?.providerID && prevMessage?.model?.modelID
        ? { providerID: prevMessage.model.providerID, modelID: prevMessage.model.modelID }
        : undefined

      if (args.resume) {
        const targetError = await validateResumeTarget(client, ctx.sessionID, args.resume)
        if (targetError) return targetError
        const targetStatusError = await validateResumeTargetIdle(client, args.resume)
        if (targetStatusError) return targetStatusError

        if (runInBackground) {
          try {
            const task = await manager.resume({
              sessionId: args.resume,
              prompt: args.prompt,
              parentSessionID: ctx.sessionID,
              parentMessageID: ctx.messageID,
              parentModel,
              parentAgent,
            })

            ctx.metadata?.({
              title: `Resume: ${task.description}`,
              metadata: { sessionId: task.sessionID },
            })

            return `Background task resumed.

Task ID: ${task.id}
Session ID: ${task.sessionID}
Description: ${task.description}
Agent: ${task.agent}
Status: ${task.status}

Agent continues with full previous context preserved.
Use \`background_output\` with task_id="${task.id}" to check progress.`
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            return `❌ Failed to resume task: ${message}`
          }
        }

        const toastManager = getTaskToastManager()
        const taskId = `resume_sync_${args.resume.slice(0, 8)}_${crypto.randomUUID().slice(0, 8)}`
        const startTime = new Date()
        const wait = waits.reserve(ctx.sessionID, args.resume)
        if (!wait.allowed) return wait.message
        try {
          const identity = await getResumeIdentity(client, args.resume)
          if (identity.error || !identity.agent || !identity.model) {
            return `❌ Failed to resume task: ${identity.error ?? "Original execution identity is incomplete"}\n\nSession ID: ${args.resume}`
          }

          if (toastManager) {
            toastManager.addTask({
              id: taskId,
              description: args.description,
              agent: identity.agent,
              isBackground: false,
            })
          }

          ctx.metadata?.({
            title: `Resume: ${args.description}`,
            metadata: { sessionId: args.resume, sync: true },
          })

          const messageID = requestMessageID()
          try {
            const promptResult = await client.session.promptAsync({
              path: { id: args.resume },
              body: {
                messageID,
                agent: identity.agent,
                model: identity.model,
                system: identity.system,
                tools: identity.tools,
                parts: [{ type: "text", text: args.prompt }],
              },
            })
            if (promptResult.error) throw new Error(String(promptResult.error))
          } catch (promptError) {
            if (toastManager) toastManager.removeTask(taskId)
            const errorMessage = promptError instanceof Error ? promptError.message : String(promptError)
            return `❌ Failed to send resume prompt: ${errorMessage}\n\nSession ID: ${args.resume}`
          }

          const waitResult = await waitForSessionIdle(
            client,
            args.resume,
            messageID,
            ctx.abort,
            maxWaitMs,
            pollIntervalMs,
          )
          if (toastManager) toastManager.removeTask(taskId)
          if (waitResult.status === "timeout") {
            return `⏳ Task exceeded the ${formatDuration(startTime)} time limit and was stopped.\n\nSession ID: ${args.resume}\n\nNo completion result was recorded.`
          }
          if (waitResult.status === "aborted") return `Task cancelled.\n\nSession ID: ${args.resume}`
          if (waitResult.status === "error") {
            return `❌ Error waiting for result: ${waitResult.error}\n\nSession ID: ${args.resume}`
          }

          const messageResult = await getAssistantMessage(client, args.resume, messageID)
          if (messageResult.error) {
            return `❌ Task failed: ${messageResult.error}\n\nSession ID: ${args.resume}`
          }

          return `Task resumed and completed in ${formatDuration(startTime)}.

Session ID: ${args.resume}
Agent: ${identity.agent}

---

${messageResult.text}`
        } finally {
          wait.release()
        }
      }

      if (args.category && args.subagent_type) {
        return `❌ Invalid arguments: Provide EITHER category OR subagent_type, not both.`
      }

      if (!args.category && !args.subagent_type) {
        return `❌ Invalid arguments: Must provide either category or subagent_type.`
      }

      let agentToUse: string
      let categoryModel: { providerID: string; modelID: string } | undefined
      let categoryPromptAppend: string | undefined

      if (args.category) {
        const resolved = resolveCategoryConfig(args.category, userCategories)
        if (!resolved) {
          return `❌ Unknown category: "${args.category}". Available: ${Object.keys({ ...DEFAULT_CATEGORIES, ...userCategories }).join(", ")}`
        }

        agentToUse = DEPUTY_AGENT
        categoryModel = resolved.config.model ? parseModelString(resolved.config.model) : undefined
        categoryPromptAppend = resolved.promptAppend || undefined
      } else {
        agentToUse = args.subagent_type!.trim()
        if (!agentToUse) {
          return `❌ Agent name cannot be empty.`
        }

        const mappedCategory = AGENT_TO_CATEGORY_MAP[agentToUse]
        if (mappedCategory) {
          categoryPromptAppend = CATEGORY_PROMPT_APPENDS[mappedCategory]
        }

        const agentModelConfig = agentModels?.[agentToUse]
        if (agentModelConfig?.model) {
          categoryModel = parseModelString(agentModelConfig.model)
        }

        // Validate agent exists and is callable (not a primary agent)
        try {
          const agentsResult = await client.app.agents()
          type AgentInfo = { name: string; mode?: "subagent" | "primary" | "all" }
          const agents = (agentsResult as { data?: AgentInfo[] }).data ?? agentsResult as unknown as AgentInfo[]

          const callableAgents = agents.filter((a) => a.mode !== "primary")
          const callableNames = callableAgents.map((a) => a.name)

          if (!callableNames.includes(agentToUse)) {
            const isPrimaryAgent = agents.some((a) => a.name === agentToUse && a.mode === "primary")
            if (isPrimaryAgent) {
              return `❌ Cannot call primary agent "${agentToUse}" via chief_task. Primary agents are top-level orchestrators.`
            }

            const availableAgents = callableNames
              .sort()
              .join(", ")
            return `❌ Unknown agent: "${agentToUse}". Available agents: ${availableAgents}`
          }
        } catch {
          // If we can't fetch agents, proceed anyway - the session.prompt will fail with a clearer error
        }
      }

      const systemContent = buildSystemContent({ skillContent, categoryPromptAppend })

      if (runInBackground) {
        const reservation = guard.reserve(ctx.sessionID, args.description, args.prompt)
        if (!reservation.allowed) return reservation.message

        try {
          const task = await manager.launch({
            description: args.description,
            prompt: args.prompt,
            agent: agentToUse,
            parentSessionID: ctx.sessionID,
            parentMessageID: ctx.messageID,
            parentModel,
            parentAgent,
            model: categoryModel,
            skills: args.skills,
            skillContent: systemContent,
          })
          reservation.commit(task.sessionID)

          ctx.metadata?.({
            title: args.description,
            metadata: { sessionId: task.sessionID, category: args.category },
          })

          return `Background task launched.

Task ID: ${task.id}
Session ID: ${task.sessionID}
Description: ${task.description}
Agent: ${task.agent}${args.category ? ` (category: ${args.category})` : ""}
Status: ${task.status}

System notifies on completion. Use \`background_output\` with task_id="${task.id}" to check.`
        } catch (error) {
          reservation.release()
          const message = error instanceof Error ? error.message : String(error)
          return `❌ Failed to launch task: ${message}`
        }
      }

      const toastManager = getTaskToastManager()
      let taskId: string | undefined
      let syncSessionID: string | undefined
      const reservation = guard.reserve(ctx.sessionID, args.description, args.prompt)
      if (!reservation.allowed) return reservation.message

      try {
        const createResult = await client.session.create({
          body: {
            parentID: ctx.sessionID,
            title: `Task: ${args.description}`,
          },
        })

        if (createResult.error) {
          reservation.release()
          return `❌ Failed to create session: ${createResult.error}`
        }

        const sessionID = createResult.data.id
        reservation.commit(sessionID)
        syncSessionID = sessionID
        subagentSessions.add(sessionID)
        taskId = `sync_${sessionID.slice(0, 8)}`
        const startTime = new Date()

        if (toastManager) {
          toastManager.addTask({
            id: taskId,
            description: args.description,
            agent: agentToUse,
            isBackground: false,
            skills: args.skills,
          })
        }

        ctx.metadata?.({
          title: args.description,
          metadata: { sessionId: sessionID, category: args.category, sync: true },
        })

        let promptError: Error | undefined
        let messageID = requestMessageID()
        const promptResult = await client.session.promptAsync({
          path: { id: sessionID },
          body: {
            messageID,
            agent: agentToUse,
            system: systemContent,
            parts: [{ type: "text", text: args.prompt }],
            ...(categoryModel ? { model: categoryModel } : {}),
          },
        }).catch((error) => {
          promptError = error instanceof Error ? error : new Error(String(error))
          return undefined
        })
        if (promptResult?.error) promptError = new Error(String(promptResult.error))

        if (promptError) {
          if (toastManager && taskId !== undefined) {
            toastManager.removeTask(taskId)
          }
          const errorMessage = promptError.message
          if (errorMessage.includes("agent.name") || errorMessage.includes("undefined")) {
            return `❌ Agent "${agentToUse}" not found. Make sure the agent is registered in your opencode.json or provided by a plugin.\n\nSession ID: ${sessionID}`
          }
          return `❌ Failed to send prompt: ${errorMessage}\n\nSession ID: ${sessionID}`
        }

        const waitResult = await waitForSessionIdle(
          client,
          sessionID,
          messageID,
          ctx.abort,
          maxWaitMs,
          pollIntervalMs,
        )
        if (waitResult.status === "timeout") {
          if (toastManager) toastManager.removeTask(taskId)
          return `⏳ Task exceeded the ${formatDuration(startTime)} time limit and was stopped.\n\nAgent: ${agentToUse}\nSession ID: ${sessionID}\n\nNo completion result was recorded.`
        }
        if (waitResult.status === "aborted") {
          if (toastManager) toastManager.removeTask(taskId)
          return `Task cancelled.\n\nSession ID: ${sessionID}`
        }
        if (waitResult.status === "error") {
          if (toastManager) toastManager.removeTask(taskId)
          return `❌ Error waiting for result: ${waitResult.error}\n\nSession ID: ${sessionID}`
        }

        let messageResult = await getAssistantMessage(client, sessionID, messageID)
        if (messageResult.error) {
          if (toastManager && taskId !== undefined) {
            toastManager.removeTask(taskId)
          }
          return `❌ Error fetching result: ${messageResult.error}\n\nSession ID: ${sessionID}`
        }

        let textContent = messageResult.text
        let attemptNumber = 1

        let qualityResult = analyzeQualityForRetry(
          textContent,
          attemptNumber,
          args.category,
          agentToUse
        )

        while (qualityResult.shouldRetry && attemptNumber < MAX_REWRITE_ATTEMPTS) {
          attemptNumber++
          log(`${LOG_PREFIX} Quality check failed, retry ${attemptNumber}/${MAX_REWRITE_ATTEMPTS}`, {
            sessionID,
            status: qualityResult.status,
            overall: qualityResult.assessment?.overall,
          })

          let retryError: Error | undefined
          messageID = requestMessageID()
          const retryResult = await client.session.promptAsync({
            path: { id: sessionID },
            body: {
              messageID,
              agent: agentToUse,
              system: systemContent,
              parts: [{ type: "text", text: qualityResult.improvementPrompt! }],
              ...(categoryModel ? { model: categoryModel } : {}),
            },
          }).catch((error) => {
            retryError = error instanceof Error ? error : new Error(String(error))
            return undefined
          })
          if (retryResult?.error) retryError = new Error(String(retryResult.error))

          if (retryError) {
            log(`${LOG_PREFIX} Retry prompt failed`, { sessionID, error: retryError.message })
            break
          }

          const retryWait = await waitForSessionIdle(
            client,
            sessionID,
            messageID,
            ctx.abort,
            maxWaitMs,
            pollIntervalMs,
          )
          if (retryWait.status !== "idle") {
            const reason = retryWait.status === "error" ? retryWait.error : retryWait.status
            log(`${LOG_PREFIX} Retry wait did not complete`, { sessionID, reason })
            if (retryWait.status === "timeout") {
              if (toastManager) toastManager.removeTask(taskId)
              return `⏳ Task retry exceeded the ${formatDuration(startTime)} time limit and was stopped.\n\nAgent: ${agentToUse}\nSession ID: ${sessionID}\n\nNo completion result was recorded.`
            }
            if (retryWait.status === "aborted") {
              if (toastManager) toastManager.removeTask(taskId)
              return `Task cancelled.\n\nSession ID: ${sessionID}`
            }
            if (toastManager) toastManager.removeTask(taskId)
            return `❌ Error waiting for task retry: ${retryWait.error}\n\nSession ID: ${sessionID}`
          }

          messageResult = await getAssistantMessage(client, sessionID, messageID)
          if (messageResult.error) {
            log(`${LOG_PREFIX} Retry fetch failed`, { sessionID, error: messageResult.error })
            break
          }

          textContent = messageResult.text
          qualityResult = analyzeQualityForRetry(
            textContent,
            attemptNumber,
            args.category,
            agentToUse
          )
        }

        const finalOutput = formatFinalOutput(qualityResult, sessionID)
        const duration = formatDuration(startTime)

        if (toastManager) {
          toastManager.removeTask(taskId)
        }

        subagentSessions.delete(sessionID)

        const retryInfo = attemptNumber > 1 ? ` (${attemptNumber} attempts)` : ""
        return `Task completed in ${duration}${retryInfo}.

Agent: ${agentToUse}${args.category ? ` (category: ${args.category})` : ""}
Session ID: ${sessionID}

---

${finalOutput}`
      } catch (error) {
        reservation.release()
        if (toastManager && taskId !== undefined) {
          toastManager.removeTask(taskId)
        }
        if (syncSessionID) {
          subagentSessions.delete(syncSessionID)
        }
        const message = error instanceof Error ? error.message : String(error)
        return `❌ Task failed: ${message}`
      } finally {
        if (syncSessionID) subagentSessions.delete(syncSessionID)
      }
    },
  })
}
