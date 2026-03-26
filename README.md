<p align="right">
  <strong>English</strong> | <a href="./README.zh-cn.md">简体中文</a>
</p>

# newtype OS

**Multi-Agent Content Team — a multi-agent orchestration system built for content production**

Created by [huangyihe](https://x.com/huangyihe).

<p>
  <a href="https://www.npmjs.com/package/@newtype-os/cli"><img src="https://img.shields.io/npm/v/@newtype-os/cli?label=%40newtype-os%2Fcli" /></a>
  <a href="https://www.npmjs.com/package/@newtype-os/plugin"><img src="https://img.shields.io/npm/v/@newtype-os/plugin?label=%40newtype-os%2Fplugin" /></a>
</p>

---

## What is this

At its core, newtype OS is an **8-agent multi-layer orchestration system** equipped with specialized skills and a memory system, purpose-built for content production.

Think of it as **a content team living in your terminal**. The Chief (Editor-in-Chief) talks to you, breaks down requirements; the Deputy dispatches execution; 6 specialists each handle their domain — research, fact-checking, retrieval, extraction, writing, and editing.

```
You ↔ Chief (Editor-in-Chief)
          ↓
      Deputy (Deputy Editor)
          ↓
      Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor
```

## Installation & Usage

newtype OS is designed for both humans and agents.

### For Humans

#### Option 1: newtype CLI (Recommended)

A ready-to-use terminal AI assistant with the full agent team built in.

```bash
npm install -g @newtype-os/cli

# Launch the TUI
nt
```

#### Option 2: As an OpenCode Plugin

If you already use [OpenCode](https://github.com/anomalyco/opencode):

```bash
cd ~/.config/opencode
bun add @newtype-os/plugin
```

Edit `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["newtype-profile"]
}
```

### For Agents

After installing newtype CLI, the system ships with a full set of CLI commands (`nt research`, `nt write`, `nt pipeline`, etc.) designed specifically for agent invocation.

Run `nt init` and newtype will automatically detect locally installed AI development tools and inject skill files, teaching agents how to use these CLI commands:

```bash
npm install -g @newtype-os/cli
nt init
```

Supported tools: Claude Code, Cursor, Copilot, Windsurf, Cline, Roo Code, Zed, Goose, Amazon Q, and more.

Once injected, these agents know when and how to call `nt research`, `nt pipeline`, and other commands to augment their own capabilities.

## Agent Team

| Agent            | Role            | Responsibility                                             |
| ---------------- | --------------- | ---------------------------------------------------------- |
| **Chief**        | Editor-in-Chief | Your entry point — thought partner + task coordinator      |
| **Deputy**       | Deputy Editor   | Chief's execution layer, dispatches downstream specialists |
| **Researcher**   | Researcher      | External intelligence gathering, trend discovery           |
| **Fact-Checker** | Verifier        | Fact verification, source credibility assessment           |
| **Archivist**    | Archivist       | Internal knowledge base retrieval and correlation          |
| **Extractor**    | Extractor       | PDF/image/web content extraction to Markdown               |
| **Writer**       | Writer          | Transforms materials into structured first drafts          |
| **Editor**       | Editor          | Language polish, logic strengthening, style consistency    |

**You only interact with Chief.** Chief automatically dispatches other agents as needed.

## Built-in Skills

Agents auto-load the corresponding skill framework when executing tasks:

| Skill                  | Command               | Description                                                                 |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Super Analyst**      | `/super-analyst`      | 12 analysis frameworks (SWOT, Porter's Five Forces, First Principles, etc.) |
| **Super Writer**       | `/super-writer`       | 6 writing methodologies (W.R.I.T.E, AIDA, Storytelling, etc.)               |
| **Super Fact-Checker** | `/super-fact-checker` | Systematic fact-checking + source credibility assessment                    |
| **Super Editor**       | `/super-editor`       | 4-layer editing: structure → paragraph → sentence → word                    |
| **Super Interviewer**  | `/super-interviewer`  | Deep dialogue techniques for requirement mining and brainstorming           |
| **Super Obsidian**     | `/super-obsidian`     | Obsidian CLI-first vault operations: search, read, create, and manage notes |

Chief auto-loads the relevant skill when a task calls for a structured framework. You can also trigger them manually via slash commands. Super Obsidian is auto-loaded when an Obsidian vault (`.obsidian/` directory) is detected.

## CLI Commands

Beyond the TUI, newtype provides a set of specialized commands for CLI and agent invocation (all support `--json` output):

| Command                 | Agent(s)                  | Description                                    |
| ----------------------- | ------------------------- | ---------------------------------------------- |
| `nt research [topic]`   | Researcher + Fact-Checker | Deep research + source verification            |
| `nt write [topic]`      | Writer                    | Multi-style content generation                 |
| `nt edit [file]`        | Editor                    | 4-layer content refinement                     |
| `nt fact-check [topic]` | Fact-Checker              | Fact-checking and cross-verification           |
| `nt analyze [topic]`    | Chief + Researcher        | Framework-based structured analysis            |
| `nt extract`            | Extractor                 | Extract content from files/URLs/images         |
| `nt archive <action>`   | Archivist                 | Knowledge base CRUD and semantic search        |
| `nt pipeline [topic]`   | Full orchestration        | Research → Analyze → Write → Fact-check → Edit |

Examples:

```bash
# Research a topic and output a report
nt research "AI Agent architecture trends 2026" -o research.md

# Write an article based on research
nt write --input research.md --style newsletter -o draft.md

# Full pipeline in one command
nt pipeline "The future of MCP" --style essay --output-dir ./output/
```

## WeChat Integration

newtype CLI has built-in [WeClaw](https://github.com/fastclaw-ai/weclaw) integration, bridging your WeChat with the full agent team via the [ACP (Agent Client Protocol)](https://github.com/nicepkg/acp). Send a message to your WeChat account, and Chief will handle it — research, write, fact-check, all from WeChat.

| Command            | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `nt wechat setup`  | Download WeClaw binary + scan QR code to link WeChat       |
| `nt wechat start`  | Start the WeChat agent bridge (auto-updates before launch) |
| `nt wechat stop`   | Stop the WeChat agent bridge                               |
| `nt wechat status` | Show installed version and running state                   |

Quick start:

```bash
nt wechat setup    # One-time: download + QR login
nt wechat start    # Start the bridge daemon
```

The agent bridge runs in the background. WeChat messages are routed to newtype's ACP server, which dispatches them to Chief using your configured model. No API key needed for WeChat — it uses the official [iLink API](https://ilinkai.weixin.qq.com).

## Memory System

newtype has a built-in automatic memory system — no manual management needed:

- **Daily summaries**: Auto-generated LLM summaries after session idle, stored in `.newtype/memory/YYYY-MM-DD.md`
- **Full transcripts**: Complete conversation history per session in `.newtype/memory/full/`
- **Long-term memory**: Old logs auto-archived to `.newtype/MEMORY.md` every 7 days
- **Auto-recall**: Relevant memories are automatically retrieved and injected into context during conversations

Use `/memory-consolidate` to manually trigger archival.

## Knowledge Base

newtype provides two knowledge base initialization commands to help agents quickly understand your project:

| Command      | Generated File | Description                                                                                  |
| ------------ | -------------- | -------------------------------------------------------------------------------------------- |
| `/init`      | `AGENTS.md`    | Project-level instruction file defining agent behavior and context for the current project   |
| `/init-deep` | `KNOWLEDGE.md` | Deep knowledge index that auto-scans project structure and generates a detailed codebase map |

## Configuration

### Connect Model Providers

Use the `/connect` command in the TUI to connect model providers (75+ supported), or via CLI:

```bash
nt auth login
```

### Configure Agent Models

**Option 1**: Use the `/agent-models` command in the TUI to configure models for each agent through the interface.

**Option 2**: Edit the config file directly.

- newtype CLI: `~/.config/newtype/newtype-profile.json`
- OpenCode plugin: `~/.config/opencode/newtype-profile.json`

```json
{
  "agents": {
    "chief": { "model": "your-preferred-model" },
    "deputy": { "model": "your-preferred-model" },
    "researcher": { "model": "your-preferred-model" },
    "writer": { "model": "your-preferred-model", "temperature": 0.7 }
  }
}
```

All 8 agents can be configured with independent models and parameters.

### MCP Servers

| MCP                     | Default  | Config             |
| ----------------------- | -------- | ------------------ |
| **websearch** (Exa)     | Enabled  | None required      |
| **sequential-thinking** | Enabled  | None required      |
| **tavily**              | Disabled | Requires `api_key` |
| **firecrawl**           | Disabled | Requires `api_key` |

### Customize Chief's Personality

Create `.newtype/SOUL.md` (or `.opencode/SOUL.md` for the OpenCode plugin) to customize Chief's communication style:

```bash
/init-soul  # Generate default template
```

### Disable Features

```json
{
  "disabled_agents": ["fact-checker"],
  "disabled_skills": ["super-analyst"],
  "disabled_hooks": ["memory-system"],
  "disabled_mcps": ["sequential-thinking"]
}
```

## Comparison

|                 | @newtype-os/plugin           | @newtype-os/cli                        |
| --------------- | ---------------------------- | -------------------------------------- |
| **Nature**      | OpenCode plugin, open source | Standalone terminal app, closed source |
| **Install**     | `bun add @newtype-os/plugin` | `npm install -g @newtype-os/cli`       |
| **Requires**    | OpenCode                     | Self-contained, no dependencies        |
| **Launch**      | `opencode`                   | `nt`                                   |
| **Config dir**  | `~/.config/opencode/`        | `~/.config/newtype/`                   |
| **Project dir** | `.opencode/`                 | `.newtype/`                            |

Supported platforms: macOS (Apple Silicon / Intel), Linux (x64 / ARM64), Windows (x64).

## Links

- **YouTube**: [youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **Twitter**: [x.com/huangyihe](https://x.com/huangyihe)
- **Substack**: [newtype.pro](https://newtype.pro/)

## License

Based on [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), follows [SUL-1.0 License](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md).
