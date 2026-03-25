import type { CommandDefinition } from "../claude-code-command-loader";

export type BuiltinCommandName =
  | "init-deep"
  | "ralph-loop"
  | "cancel-ralph"
  | "switch"
  | "super-analyst"
  | "super-writer"
  | "super-fact-checker"
  | "super-editor"
  | "super-interviewer"
  | "super-obsidian"
  | "memory-consolidate"
  | "configure-models"
  | "init-soul";

export interface BuiltinCommandConfig {
  disabled_commands?: BuiltinCommandName[];
}

export type BuiltinCommands = Record<string, CommandDefinition>;
