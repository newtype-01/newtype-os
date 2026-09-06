import {
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
} from "./lsp"

import {
  ast_grep_search,
  ast_grep_replace,
} from "./ast-grep"

import { grep } from "./grep"
import { glob } from "./glob"
export { createSlashcommandTool, discoverCommandsSync } from "./slashcommand"

import {
  session_list,
  session_read,
  session_search,
  session_info,
} from "./session-manager"

import { knowledge_base } from "./knowledge-base"
import { workbench } from "./workbench"

export { sessionExists } from "./session-manager/storage"
export { createSessionTools } from "./session-manager"

export { interactive_bash, startBackgroundCheck as startTmuxCheck } from "./interactive-bash"
export { createSkillTool, createSkillCatalogTool } from "./skill"
export { getTmuxPath } from "./interactive-bash/utils"
export { createSkillMcpTool } from "./skill-mcp"

import {
  createBackgroundOutput,
  createBackgroundCancel,
} from "./background-task"

import type { PluginInput, ToolDefinition } from "@opencode-ai/plugin"
import type { BackgroundManager } from "../features/background-agent"

type OpencodeClient = PluginInput["client"]


export { createLookAt } from "./look-at"
export { createChiefTask, type ChiefTaskToolOptions, DEFAULT_CATEGORIES, CATEGORY_PROMPT_APPENDS } from "./chief-task"

export function createBackgroundTools(manager: BackgroundManager, client: OpencodeClient): Record<string, ToolDefinition> {
  return {
    background_output: createBackgroundOutput(manager, client),
    background_cancel: createBackgroundCancel(manager, client),
  }
}

export const builtinTools: Record<string, ToolDefinition> = {
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
  ast_grep_search,
  ast_grep_replace,
  grep,
  glob,
  session_list,
  session_read,
  session_search,
  session_info,
  knowledge_base,
  workbench,
}
