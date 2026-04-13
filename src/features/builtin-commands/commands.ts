import type { CommandDefinition } from "../claude-code-command-loader";
import type { BuiltinCommandName, BuiltinCommands } from "./types";
import { WIKI_TEMPLATE } from "./templates/wiki";
import {
  RALPH_LOOP_TEMPLATE,
  CANCEL_RALPH_TEMPLATE,
} from "./templates/ralph-loop";
import { SWITCH_PLUGIN_TEMPLATE } from "./templates/switch-plugin";
import { MEMORY_CONSOLIDATE_TEMPLATE } from "./templates/memory-consolidate";
import { CONFIGURE_MODELS_TEMPLATE } from "./templates/configure-models";
import { INIT_SOUL_TEMPLATE } from "./templates/init-soul";

const BUILTIN_COMMAND_DEFINITIONS: Record<
  BuiltinCommandName,
  Omit<CommandDefinition, "name">
> = {
  wiki: {
    description:
      "(builtin) Generate project wiki: KNOWLEDGE.md + .opencode/wiki/",
    template: `<command-instruction>
${WIKI_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[path] [lint] [--create-new] [--max-depth=N]",
  },
  "ralph-loop": {
    description: "(builtin) Start self-referential task loop until completion",
    template: `<command-instruction>
${RALPH_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
    argumentHint:
      '"task description" [--completion-promise=TEXT] [--max-iterations=N]',
  },
  "cancel-ralph": {
    description: "(builtin) Cancel active Ralph Loop",
    template: `<command-instruction>
${CANCEL_RALPH_TEMPLATE}
</command-instruction>`,
  },
  switch: {
    description: "(builtin) Switch OpenCode plugin (newtype/omo/none)",
    template: `<command-instruction>
${SWITCH_PLUGIN_TEMPLATE}
</command-instruction>`,
    argumentHint: "<newtype|omo|none>",
  },
  "super-analyst": {
    description:
      "(builtin) Elite analytical consulting system with 12 professional frameworks",
    template: `<command-instruction>
Use the skill tool to load the super-analyst skill, then follow its instructions.

Call: skill({ name: "super-analyst" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<analysis question or problem>",
  },
  "super-writer": {
    description:
      "(builtin) Professional content creation with 6 writing methodologies",
    template: `<command-instruction>
Use the skill tool to load the super-writer skill, then follow its instructions.

Call: skill({ name: "super-writer" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<content creation request>",
  },
  "super-fact-checker": {
    description:
      "(builtin) Systematic verification with source credibility assessment",
    template: `<command-instruction>
Use the skill tool to load the super-fact-checker skill, then follow its instructions.

Call: skill({ name: "super-fact-checker" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<content or claims to verify>",
  },
  "super-editor": {
    description:
      "(builtin) 4-layer editing methodology: structure → paragraph → sentence → word",
    template: `<command-instruction>
Use the skill tool to load the super-editor skill, then follow its instructions.

Call: skill({ name: "super-editor" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<content to edit>",
  },
  "super-interviewer": {
    description:
      "(builtin) Dialogue techniques: open questions, 5 whys, Socratic method",
    template: `<command-instruction>
Use the skill tool to load the super-interviewer skill, then follow its instructions.

Call: skill({ name: "super-interviewer" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<topic or question to explore>",
  },
  "super-obsidian": {
    description:
      "(builtin) Obsidian CLI-first knowledge base operations for vault management",
    template: `<command-instruction>
Use the skill tool to load the super-obsidian skill, then follow its instructions.

Call: skill({ name: "super-obsidian" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<vault operation or search query>",
  },
  "super-workflow": {
    description:
      "(builtin) End-to-end content production workflow with mandatory quality gates",
    template: `<command-instruction>
Use the skill tool to load the super-workflow skill, then follow its instructions.

Call: skill({ name: "super-workflow" })
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<content production task>",
  },
  "memory-consolidate": {
    description: "(builtin) Consolidate daily memory logs into MEMORY.md",
    template: `<command-instruction>
${MEMORY_CONSOLIDATE_TEMPLATE}
</command-instruction>`,
  },
  "configure-models": {
    description:
      "(builtin) Configure Agent models based on available providers",
    template: `<command-instruction>
${CONFIGURE_MODELS_TEMPLATE}
</command-instruction>`,
  },
  "init-soul": {
    description:
      "(builtin) Create or reset SOUL.md for customizing Chief's personality",
    template: `<command-instruction>
${INIT_SOUL_TEMPLATE}
</command-instruction>`,
  },
};

export function loadBuiltinCommands(
  disabledCommands?: BuiltinCommandName[],
): BuiltinCommands {
  const disabled = new Set(disabledCommands ?? []);
  const commands: BuiltinCommands = {};

  for (const [name, definition] of Object.entries(
    BUILTIN_COMMAND_DEFINITIONS,
  )) {
    if (!disabled.has(name as BuiltinCommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition;
      commands[name] = openCodeCompatible as CommandDefinition;
    }
  }

  return commands;
}
