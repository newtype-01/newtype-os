import type { Plugin } from "@opencode-ai/plugin";
import {
  createTodoContinuationEnforcer,
  createContextWindowMonitorHook,
  createSessionRecoveryHook,
  createSessionNotification,
  createCommentCheckerHooks,
  createToolOutputTruncatorHook,
  createDirectoryAgentsInjectorHook,
  createDirectoryReadmeInjectorHook,
  createEmptyTaskResponseDetectorHook,
  createThinkModeHook,
  createClaudeCodeHooksHook,
  createAnthropicContextWindowLimitRecoveryHook,
  createPreemptiveCompactionHook,
  createCompactionContextInjector,
  createRulesInjectorHook,
  createBackgroundNotificationHook,
  createAutoUpdateCheckerHook,
  createKeywordDetectorHook,
  createAgentUsageReminderHook,
  createNonInteractiveEnvHook,
  createInteractiveBashSessionHook,
  createEmptyMessageSanitizerHook,
  createThinkingBlockValidatorHook,
  createRalphLoopHook,
  createAutoSlashCommandHook,
  createEditErrorRecoveryHook,
  createTaskResumeInfoHook,
  createChiefOrchestratorHook,
  createPrometheusMdOnlyHook,
  createMemorySystemHook,
  createStartupConfigCheckerHook,
  createWorkbenchCheckpointHook,
} from "./hooks";
import { setConfidenceConfig } from "./hooks/chief-orchestrator/confidence-router";
import {
  contextCollector,
  createContextInjectorHook,
  createContextInjectorMessagesTransformHook,
} from "./features/context-injector";
import { createGoogleAntigravityAuthPlugin } from "./auth/antigravity";
import {
  discoverUserClaudeSkills,
  discoverProjectClaudeSkills,
  discoverOpencodeGlobalSkills,
  discoverOpencodeProjectSkills,
  mergeSkills,
} from "./features/opencode-skill-loader";
import { createBuiltinSkills } from "./features/builtin-skills";
import { getSystemMcpServerNames } from "./features/claude-code-mcp-loader";
import {
  setMainSession,
  getMainSessionID,
} from "./features/claude-code-session-state";
import {
  builtinTools,
  createBackgroundTools,
  createLookAt,
  createSkillTool,
  createSkillCatalogTool,
  createSkillMcpTool,
  createSlashcommandTool,
  discoverCommandsSync,
  sessionExists,
  createChiefTask,
  interactive_bash,
  startTmuxCheck,
} from "./tools";
import { BackgroundManager } from "./features/background-agent";
import { SkillMcpManager } from "./features/skill-mcp-manager";
import { initTaskToastManager } from "./features/task-toast-manager";
import { type HookName } from "./config";
import { log, detectExternalNotificationPlugin, getNotificationConflictWarning, safeCreateHook } from "./shared";
import { loadPluginConfig } from "./plugin-config";
import { createModelCacheState, getModelLimit } from "./plugin-state";
import { createConfigHandler } from "./plugin-handlers";
import { getLongTermMemoryContext, getRecentMemoryContext } from "./hooks/memory-system/recall";

const OhMyOpenCodePlugin: Plugin = async (ctx) => {
  // Start background tmux check immediately
  startTmuxCheck();

  const pluginConfig = loadPluginConfig(ctx.directory, ctx);
  const disabledHooks = new Set(pluginConfig.disabled_hooks ?? []);
  const isHookEnabled = (hookName: HookName) => !disabledHooks.has(hookName);

  const modelCacheState = createModelCacheState();

  const contextWindowMonitor = isHookEnabled("context-window-monitor")
    ? safeCreateHook("context-window-monitor", () => createContextWindowMonitorHook(ctx))
    : null;
  const sessionRecovery = isHookEnabled("session-recovery")
    ? safeCreateHook("session-recovery", () => createSessionRecoveryHook(ctx, { experimental: pluginConfig.experimental }))
    : null;
  
  // Check for conflicting notification plugins before creating session-notification
  let sessionNotification = null;
  if (isHookEnabled("session-notification")) {
    const forceEnable = pluginConfig.notification?.force_enable ?? false;
    const externalNotifier = detectExternalNotificationPlugin(ctx.directory);
    
    if (externalNotifier.detected && !forceEnable) {
      // External notification plugin detected - skip our notification to avoid conflicts
      console.warn(getNotificationConflictWarning(externalNotifier.pluginName!));
      log("session-notification disabled due to external notifier conflict", {
        detected: externalNotifier.pluginName,
        allPlugins: externalNotifier.allPlugins,
      });
    } else {
      sessionNotification = safeCreateHook("session-notification", () => createSessionNotification(ctx));
    }
  }

  const commentChecker = isHookEnabled("comment-checker")
    ? safeCreateHook("comment-checker", () => createCommentCheckerHooks(pluginConfig.comment_checker))
    : null;
  const toolOutputTruncator = isHookEnabled("tool-output-truncator")
    ? safeCreateHook("tool-output-truncator", () => createToolOutputTruncatorHook(ctx, {
        experimental: pluginConfig.experimental,
      }))
    : null;
  const directoryAgentsInjector = isHookEnabled("directory-agents-injector")
    ? safeCreateHook("directory-agents-injector", () => createDirectoryAgentsInjectorHook(ctx))
    : null;
  const directoryReadmeInjector = isHookEnabled("directory-readme-injector")
    ? safeCreateHook("directory-readme-injector", () => createDirectoryReadmeInjectorHook(ctx))
    : null;
  const emptyTaskResponseDetector = isHookEnabled("empty-task-response-detector")
    ? safeCreateHook("empty-task-response-detector", () => createEmptyTaskResponseDetectorHook(ctx))
    : null;
  const thinkMode = isHookEnabled("think-mode") ? safeCreateHook("think-mode", () => createThinkModeHook()) : null;
  const defaultClaudeCodeHooks: ReturnType<typeof createClaudeCodeHooksHook> = {
    "experimental.session.compacting": async () => {},
    "chat.message": async () => {},
    "tool.execute.before": async () => {},
    "tool.execute.after": async () => {},
    event: async () => {},
  };

  const claudeCodeHooks = safeCreateHook(
    "claude-code-hooks",
    () => createClaudeCodeHooksHook(
      ctx,
      {
        disabledHooks: (pluginConfig.claude_code?.hooks ?? true) ? undefined : true,
        keywordDetectorDisabled: !isHookEnabled("keyword-detector"),
      },
      contextCollector
    ),
    defaultClaudeCodeHooks
  )!;
  const anthropicContextWindowLimitRecovery = isHookEnabled(
    "anthropic-context-window-limit-recovery"
  )
    ? safeCreateHook("anthropic-context-window-limit-recovery", () => createAnthropicContextWindowLimitRecoveryHook(ctx, {
        experimental: pluginConfig.experimental,
        dcpForCompaction: pluginConfig.experimental?.dcp_for_compaction,
      }))
    : null;
  const compactionContextInjector = isHookEnabled("compaction-context-injector")
    ? safeCreateHook("compaction-context-injector", () => createCompactionContextInjector()) ?? undefined
    : undefined;
  const defaultPreemptiveCompaction: ReturnType<typeof createPreemptiveCompactionHook> = { event: async () => {} };
  const preemptiveCompaction = isHookEnabled("preemptive-compaction")
    ? safeCreateHook("preemptive-compaction", () => createPreemptiveCompactionHook(ctx, {
        experimental: pluginConfig.experimental,
        onBeforeSummarize: compactionContextInjector,
        getModelLimit: (providerID, modelID) =>
          getModelLimit(modelCacheState, providerID, modelID),
      }), defaultPreemptiveCompaction)
    : null;
  const rulesInjector = isHookEnabled("rules-injector")
    ? safeCreateHook("rules-injector", () => createRulesInjectorHook(ctx))
    : null;
  const autoUpdateChecker = isHookEnabled("auto-update-checker")
    ? safeCreateHook("auto-update-checker", () => createAutoUpdateCheckerHook(ctx, {
        showStartupToast: isHookEnabled("startup-toast"),
        isChiefEnabled: pluginConfig.chief_agent?.disabled !== true,
        autoUpdate: pluginConfig.auto_update ?? true,
      }))
    : null;
  const keywordDetector = isHookEnabled("keyword-detector")
    ? safeCreateHook("keyword-detector", () => createKeywordDetectorHook(ctx))
    : null;
  const contextInjector = safeCreateHook("context-injector", () => createContextInjectorHook(contextCollector), {
    "chat.message": async () => {},
  })!;
  const defaultContextInjectorMessagesTransform: ReturnType<typeof createContextInjectorMessagesTransformHook> = {
    "experimental.chat.messages.transform": async () => {},
  };
  const contextInjectorMessagesTransform =
    safeCreateHook(
      "context-injector-messages-transform",
      () => createContextInjectorMessagesTransformHook(contextCollector),
      defaultContextInjectorMessagesTransform
    );
  const agentUsageReminder = isHookEnabled("agent-usage-reminder")
    ? safeCreateHook("agent-usage-reminder", () => createAgentUsageReminderHook(ctx))
    : null;
  const nonInteractiveEnv = isHookEnabled("non-interactive-env")
    ? safeCreateHook("non-interactive-env", () => createNonInteractiveEnvHook(ctx))
    : null;
  const interactiveBashSession = isHookEnabled("interactive-bash-session")
    ? safeCreateHook("interactive-bash-session", () => createInteractiveBashSessionHook(ctx))
    : null;
  const emptyMessageSanitizer = isHookEnabled("empty-message-sanitizer")
    ? safeCreateHook("empty-message-sanitizer", () => createEmptyMessageSanitizerHook())
    : null;
  const thinkingBlockValidator = isHookEnabled("thinking-block-validator")
    ? safeCreateHook("thinking-block-validator", () => createThinkingBlockValidatorHook())
    : null;

  const ralphLoop = isHookEnabled("ralph-loop")
    ? safeCreateHook("ralph-loop", () => createRalphLoopHook(ctx, {
        config: pluginConfig.ralph_loop,
        checkSessionExists: async (sessionId) => sessionExists(sessionId),
      }))
    : null;

  const editErrorRecovery = isHookEnabled("edit-error-recovery")
    ? safeCreateHook("edit-error-recovery", () => createEditErrorRecoveryHook(ctx))
    : null;

  if (pluginConfig.confidence) {
    setConfidenceConfig(pluginConfig.confidence);
  }

  const chiefOrchestrator = isHookEnabled("chief-orchestrator")
    ? safeCreateHook("chief-orchestrator", () => createChiefOrchestratorHook(ctx))
    : null;

  const prometheusMdOnly = isHookEnabled("prometheus-md-only")
    ? safeCreateHook("prometheus-md-only", () => createPrometheusMdOnlyHook(ctx))
    : null;

  const memorySystem = isHookEnabled("memory-system")
    ? safeCreateHook("memory-system", () => createMemorySystemHook(ctx))
    : null;

  const workbenchCheckpoint = isHookEnabled("workbench-checkpoint")
    ? safeCreateHook("workbench-checkpoint", () => createWorkbenchCheckpointHook(ctx))
    : null;

  const startupConfigChecker = isHookEnabled("startup-config-checker")
    ? safeCreateHook("startup-config-checker", () => createStartupConfigCheckerHook(ctx, pluginConfig))
    : null;

  const taskResumeInfo = safeCreateHook("task-resume-info", () => createTaskResumeInfoHook(), {
    "tool.execute.after": async () => {},
  })!;

  const backgroundManager = new BackgroundManager(ctx);

  initTaskToastManager(ctx.client);

  const todoContinuationEnforcer = isHookEnabled("todo-continuation-enforcer")
    ? safeCreateHook("todo-continuation-enforcer", () => createTodoContinuationEnforcer(ctx, { backgroundManager }))
    : null;

  if (sessionRecovery && todoContinuationEnforcer) {
    sessionRecovery.setOnAbortCallback(todoContinuationEnforcer.markRecovering);
    sessionRecovery.setOnRecoveryCompleteCallback(
      todoContinuationEnforcer.markRecoveryComplete
    );
  }

  const backgroundNotificationHook = isHookEnabled("background-notification")
    ? safeCreateHook("background-notification", () => createBackgroundNotificationHook(backgroundManager))
    : null;
  const backgroundTools = createBackgroundTools(backgroundManager, ctx.client);

  const lookAt = createLookAt(ctx);
  const agentModels = pluginConfig.agents as Record<string, { model?: string }> | undefined;
  const chiefTask = createChiefTask({
    manager: backgroundManager,
    client: ctx.client,
    userCategories: pluginConfig.categories,
    agentModels,
  });
  const disabledSkills = new Set(pluginConfig.disabled_skills ?? []);
  const systemMcpNames = getSystemMcpServerNames();
  const builtinSkills = createBuiltinSkills().filter((skill) => {
    if (disabledSkills.has(skill.name as never)) return false;
    if (skill.mcpConfig) {
      for (const mcpName of Object.keys(skill.mcpConfig)) {
        if (systemMcpNames.has(mcpName)) return false;
      }
    }
    return true;
  });
  const includeClaudeSkills = pluginConfig.claude_code?.skills !== false;
  const [userSkills, globalSkills, projectSkills, opencodeProjectSkills] = await Promise.all([
    includeClaudeSkills ? discoverUserClaudeSkills() : Promise.resolve([]),
    discoverOpencodeGlobalSkills(),
    includeClaudeSkills ? discoverProjectClaudeSkills() : Promise.resolve([]),
    discoverOpencodeProjectSkills(),
  ]);
  const mergedSkills = mergeSkills(
    builtinSkills,
    pluginConfig.skills,
    userSkills,
    globalSkills,
    projectSkills,
    opencodeProjectSkills
  );
  const skillMcpManager = new SkillMcpManager();
  const getSessionIDForMcp = () => getMainSessionID() || "";
  const skillTool = createSkillTool({
    skills: mergedSkills,
    mcpManager: skillMcpManager,
    getSessionID: getSessionIDForMcp,
  });
  const skillCatalogTool = createSkillCatalogTool({
    skills: mergedSkills,
  });
  const skillMcpTool = createSkillMcpTool({
    manager: skillMcpManager,
    getLoadedSkills: () => mergedSkills,
    getSessionID: getSessionIDForMcp,
  });

  const commands = discoverCommandsSync();
  const slashcommandTool = createSlashcommandTool({
    commands,
    skills: mergedSkills,
  });

  const autoSlashCommand = isHookEnabled("auto-slash-command")
    ? safeCreateHook("auto-slash-command", () => createAutoSlashCommandHook({ skills: mergedSkills }), {
        "chat.message": async () => {},
      })
    : null;

  const googleAuthHooks = pluginConfig.google_auth !== false
    ? await createGoogleAntigravityAuthPlugin(ctx)
    : null;

  const configHandler = createConfigHandler({
    ctx,
    pluginConfig,
    modelCacheState,
  });

  return {
    ...(googleAuthHooks ? { auth: googleAuthHooks.auth } : {}),

    tool: {
      ...builtinTools,
      ...backgroundTools,
      look_at: lookAt,
      chief_task: chiefTask,
      skill: skillTool,
      skill_catalog: skillCatalogTool,
      skill_mcp: skillMcpTool,
      slashcommand: slashcommandTool,
      interactive_bash,
    },

    "chat.message": async (input, output) => {
      const promptText = (
        output as { parts?: Array<{ type: string; text?: string }> }
      ).parts
        ?.filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("\n")
        .trim() || "";

      await claudeCodeHooks["chat.message"]?.(input, output);
      await keywordDetector?.["chat.message"]?.(input, output);
      if (isHookEnabled("memory-system")) {
        const recent = getRecentMemoryContext(ctx.directory, promptText);
        if (recent) {
          contextCollector.register(input.sessionID, {
            id: "memory-recall",
            source: "memory-system",
            content: recent,
            priority: "low",
          });
        }
        const longTerm = getLongTermMemoryContext(ctx.directory, promptText);
        if (longTerm) {
          contextCollector.register(input.sessionID, {
            id: "memory-longterm",
            source: "memory-system",
            content: longTerm,
            priority: "low",
          });
        }
      }
      await contextInjector["chat.message"]?.(input, output);
      await autoSlashCommand?.["chat.message"]?.(input, output);

      if (ralphLoop) {
        const isRalphLoopTemplate =
          promptText.includes("You are starting a Ralph Loop") &&
          promptText.includes("<user-task>");
        const isCancelRalphTemplate = promptText.includes(
          "Cancel the currently active Ralph Loop"
        );

        if (isRalphLoopTemplate) {
          const taskMatch = promptText.match(
            /<user-task>\s*([\s\S]*?)\s*<\/user-task>/i
          );
          const rawTask = taskMatch?.[1]?.trim() || "";

          const quotedMatch = rawTask.match(/^["'](.+?)["']/);
          const prompt =
            quotedMatch?.[1] ||
            rawTask.split(/\s+--/)[0]?.trim() ||
            "Complete the task as instructed";

          const maxIterMatch = rawTask.match(/--max-iterations=(\d+)/i);
          const promiseMatch = rawTask.match(
            /--completion-promise=["']?([^"'\s]+)["']?/i
          );

          log("[ralph-loop] Starting loop from chat.message", {
            sessionID: input.sessionID,
            prompt,
          });
          ralphLoop.startLoop(input.sessionID, prompt, {
            maxIterations: maxIterMatch
              ? parseInt(maxIterMatch[1], 10)
              : undefined,
            completionPromise: promiseMatch?.[1],
          });
        } else if (isCancelRalphTemplate) {
          log("[ralph-loop] Cancelling loop from chat.message", {
            sessionID: input.sessionID,
          });
          ralphLoop.cancelLoop(input.sessionID);
        }
      }
    },

    "experimental.chat.messages.transform": async (
      input: Record<string, never>,
      output: { messages: Array<{ info: unknown; parts: unknown[] }> }
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await contextInjectorMessagesTransform?.["experimental.chat.messages.transform"]?.(input, output as any);
      await thinkingBlockValidator?.[
        "experimental.chat.messages.transform"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]?.(input, output as any);
      await emptyMessageSanitizer?.[
        "experimental.chat.messages.transform"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]?.(input, output as any);
    },

    "experimental.chat.system.transform": async (
      input: { sessionID?: string },
      output: { system: string[] }
    ) => {
      startupConfigChecker?.["experimental.chat.system.transform"]?.(input, output);
    },

    config: configHandler,

    event: async (input) => {
      autoUpdateChecker?.event(input);
      claudeCodeHooks.event(input);
      backgroundNotificationHook?.event(input);
      sessionNotification?.(input);
      todoContinuationEnforcer?.handler(input);
      contextWindowMonitor?.event(input);
      directoryAgentsInjector?.event(input);
      directoryReadmeInjector?.event(input);
      rulesInjector?.event(input);
      thinkMode?.event(input);
      anthropicContextWindowLimitRecovery?.event(input);
      preemptiveCompaction?.event(input);
      agentUsageReminder?.event(input);
      interactiveBashSession?.event(input);
      ralphLoop?.event(input);
      chiefOrchestrator?.handler(input);
      await memorySystem?.event(input);
      workbenchCheckpoint?.event(input);
      startupConfigChecker?.event(input);

      const { event } = input;
      const props = event.properties as Record<string, unknown> | undefined;

      if (event.type === "session.created") {
        const sessionInfo = props?.info as
          | { id?: string; title?: string; parentID?: string }
          | undefined;
        if (!sessionInfo?.parentID) {
          setMainSession(sessionInfo?.id);
        }
      }

      if (event.type === "session.deleted") {
        const sessionInfo = props?.info as { id?: string } | undefined;
        if (sessionInfo?.id === getMainSessionID()) {
          setMainSession(undefined);
        }
        if (sessionInfo?.id) {
          await skillMcpManager.disconnectSession(sessionInfo.id);
        }
      }

      if (event.type === "session.error") {
        const sessionID = props?.sessionID as string | undefined;
        const error = props?.error;

        if (sessionRecovery?.isRecoverableError(error)) {
          const messageInfo = {
            id: props?.messageID as string | undefined,
            role: "assistant" as const,
            sessionID,
            error,
          };
          const recovered =
            await sessionRecovery.handleSessionRecovery(messageInfo);

          if (recovered && sessionID && sessionID === getMainSessionID()) {
            await ctx.client.session
              .prompt({
                path: { id: sessionID },
                body: { parts: [{ type: "text", text: "continue" }] },
                query: { directory: ctx.directory },
              })
              .catch(() => {});
          }
        }
      }
    },

    dispose: async () => {
      await memorySystem?.dispose();
    },

    "tool.execute.before": async (input, output) => {
      await claudeCodeHooks["tool.execute.before"](input, output);
      await nonInteractiveEnv?.["tool.execute.before"](input, output);
      await commentChecker?.["tool.execute.before"](input, output);
      await directoryAgentsInjector?.["tool.execute.before"]?.(input, output);
      await directoryReadmeInjector?.["tool.execute.before"]?.(input, output);
      await rulesInjector?.["tool.execute.before"]?.(input, output);
      await prometheusMdOnly?.["tool.execute.before"]?.(input, output);
      await chiefOrchestrator?.["tool.execute.before"]?.(input, output);

      if (input.tool === "task") {
        const args = output.args as Record<string, unknown>;

        args.tools = {
          ...(args.tools as Record<string, boolean> | undefined),
          chief_task: false,
        };
      }

      if (ralphLoop && input.tool === "slashcommand") {
        const args = output.args as { command?: string } | undefined;
        const command = args?.command?.replace(/^\//, "").toLowerCase();
        const sessionID = input.sessionID || getMainSessionID();

        if (command === "ralph-loop" && sessionID) {
          const rawArgs =
            args?.command?.replace(/^\/?(ralph-loop)\s*/i, "") || "";
          const taskMatch = rawArgs.match(/^["'](.+?)["']/);
          const prompt =
            taskMatch?.[1] ||
            rawArgs.split(/\s+--/)[0]?.trim() ||
            "Complete the task as instructed";

          const maxIterMatch = rawArgs.match(/--max-iterations=(\d+)/i);
          const promiseMatch = rawArgs.match(
            /--completion-promise=["']?([^"'\s]+)["']?/i
          );

          ralphLoop.startLoop(sessionID, prompt, {
            maxIterations: maxIterMatch
              ? parseInt(maxIterMatch[1], 10)
              : undefined,
            completionPromise: promiseMatch?.[1],
          });
        } else if (command === "cancel-ralph" && sessionID) {
          ralphLoop.cancelLoop(sessionID);
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      await claudeCodeHooks["tool.execute.after"](input, output);
      await toolOutputTruncator?.["tool.execute.after"](input, output);
      await contextWindowMonitor?.["tool.execute.after"](input, output);
      await commentChecker?.["tool.execute.after"](input, output);
      await directoryAgentsInjector?.["tool.execute.after"](input, output);
      await directoryReadmeInjector?.["tool.execute.after"](input, output);
      await rulesInjector?.["tool.execute.after"](input, output);
      await emptyTaskResponseDetector?.["tool.execute.after"](input, output);
      await agentUsageReminder?.["tool.execute.after"](input, output);
      await interactiveBashSession?.["tool.execute.after"](input, output);
      await editErrorRecovery?.["tool.execute.after"](input, output);
      await chiefOrchestrator?.["tool.execute.after"]?.(input, output);
      await taskResumeInfo["tool.execute.after"](input, output);
    },
  };
};

export default OhMyOpenCodePlugin;

export type {
  OhMyOpenCodeConfig,
  AgentName,
  AgentOverrideConfig,
  AgentOverrides,
  McpName,
  HookName,
  BuiltinCommandName,
} from "./config";

// NOTE: Do NOT export functions from main index.ts!
// OpenCode treats ALL exports as plugin instances and calls them.
// Config error utilities are available via "./shared/config-errors" for internal use only.
export type { ConfigLoadError } from "./shared/config-errors";
