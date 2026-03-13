<p align="right">
  <strong>English</strong> | <a href="./README.zh-cn.md">简体中文</a>
</p>

# newtype-profile

**AI Agent Collaboration System for Content Creation**

Based on [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), redesigned for content creation scenarios.

---

## Created by huangyihe (黄益贺)

- **YouTube**: [https://www.youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **Twitter**: [https://x.com/huangyihe](https://x.com/huangyihe)
- **Substack**: [https://newtype.pro/](https://newtype.pro/)
- **知识星球**: [https://t.zsxq.com/19IaNz5wK](https://t.zsxq.com/19IaNz5wK)

---

## Overview

newtype-profile is an AI Agent collaboration framework designed for **content creation**:

- 📚 Knowledge base management
- ✍️ Article writing and editing
- 🔍 Information research and fact-checking
- 📄 Document extraction and organization

## Two Ways to Use

### Option A: Newtype CLI (Recommended)

[**Newtype CLI**](https://www.npmjs.com/package/@newtype-os/cli) is a standalone terminal AI assistant with newtype-profile built-in. No plugin setup needed — install and go.

```bash
npm install -g @newtype-os/cli
newtype
```

Newtype CLI is a white-labeled fork of [OpenCode](https://github.com/anomalyco/opencode) with the full agent team pre-configured.

### Option B: As an OpenCode Plugin

If you already use OpenCode and want to add newtype-profile as a plugin:

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

## Agent Team

| Agent | Role | Description |
|-------|------|-------------|
| **chief** | Editor-in-Chief | Dual-mode: exploration partner + task coordinator |
| **deputy** | Deputy Editor | Executes delegated tasks |
| **researcher** | Intelligence | Broad search, discover new information |
| **fact-checker** | Verifier | Validate sources, assess credibility |
| **archivist** | Librarian | Knowledge base retrieval |
| **extractor** | Formatter | PDF/image/document extraction |
| **writer** | Writer | Content production |
| **editor** | Editor | Content refinement |

## Configure Models

Create a config file to customize which models each agent uses:

- **Newtype CLI**: `~/.config/newtype/newtype-profile.json`
- **OpenCode plugin**: `~/.config/opencode/newtype-profile.json`

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

All 8 agents (`chief`, `deputy`, `researcher`, `fact-checker`, `archivist`, `extractor`, `writer`, `editor`) can be configured independently.

<details>
<summary>Optional: Google Antigravity OAuth</summary>

If using Google Antigravity as your model provider, add `google_auth`:

```json
{
  "google_auth": true,
  "agents": {
    "chief": { "model": "google/antigravity-claude-opus-4-5-thinking-high" }
  }
}
```

Then authenticate:

```bash
opencode auth login
# Select Provider: Google
# Select Login method: OAuth with Google (Antigravity)
```

</details>

## Usage

### Three-Layer Architecture

```
User ↔ Chief (Editor-in-Chief)
           ↓ chief_task
       Deputy (Deputy Editor)
           ↓ chief_task
       Specialist Agents (researcher, writer, editor...)
```

**You only interact with Chief**:

- **Mode 1 - Thought Partner**: Chief thinks WITH you, challenges flawed logic
- **Mode 2 - Execution Coordinator**: Chief decomposes, delegates, and delivers

### Example Conversations

```
"Help me understand the AI development trends in 2024"
"Write an article about this topic based on our research"
"Verify the sources in this document"
```

## Customization

### SOUL.md - Customize Chief's Personality (v1.0.60+)

Chief's personality has three layers:
- **Capabilities** (hardcoded): What Chief can do
- **Inner Persona** (hardcoded): Core values and thinking patterns
- **Outer Persona** (customizable): Communication style

Create `.opencode/SOUL.md` (or `.newtype/SOUL.md` for Newtype CLI) to customize how Chief communicates:

```bash
/init-soul  # Creates default SOUL.md template
```

Example customizations:
- Make Chief more formal or casual
- Adjust language preferences
- Change how direct Chief is

Changes take effect after restarting.

### Built-in Skills

| Skill | Command | Description |
|-------|---------|-------------|
| **super-analyst** | `/super-analyst` | 12 analysis frameworks + research methodology |
| **super-writer** | `/super-writer` | 6 writing methodologies (W.R.I.T.E, AIDA, etc.) |
| **super-fact-checker** | `/super-fact-checker` | Claim verification with source credibility |
| **super-editor** | `/super-editor` | 4-layer editing: structure → paragraph → sentence → word |
| **super-interviewer** | `/super-interviewer` | Dialogue techniques for exploration |
| **playwright** | `/playwright` | Browser automation |

Chief auto-loads skills when tasks need structured frameworks.

### MCP Servers

Built-in MCPs:

| MCP | Default | Config |
|-----|---------|--------|
| **websearch** (Exa) | Enabled | None |
| **sequential-thinking** | Enabled | None |
| **tavily** | Disabled | `api_key` |
| **firecrawl** | Disabled | `api_key` |

### Disable Features

```json
{
  "disabled_agents": ["fact-checker"],
  "disabled_skills": ["super-analyst"],
  "disabled_hooks": ["memory-system"],
  "disabled_mcps": ["sequential-thinking"]
}
```

## Memory System

Auto-saves conversation summaries to `.opencode/memory/` (or `.newtype/memory/`):
- Daily summaries (LLM-generated)
- Full transcripts per session
- Auto-archive to `MEMORY.md` after 7 days

Use `/memory-consolidate` to manually trigger consolidation.

## Other Features

- **Background Tasks**: Run multiple agents in parallel
- **Session Recovery**: Auto-recover from errors
- **Startup Config Checker**: Guides model setup on first run
- **Plugin Switching**: `/switch newtype` / `/switch omo` / `/switch none`

## Newtype CLI

[Newtype CLI](https://www.npmjs.com/package/@newtype-os/cli) is a standalone product that bundles newtype-profile into a ready-to-use terminal AI assistant.

| | newtype-profile (plugin) | Newtype CLI |
|---|---|---|
| **Install** | `bun add @newtype-os/plugin` in OpenCode | `npm install -g @newtype-os/cli` |
| **Requires** | OpenCode installed separately | Nothing — self-contained |
| **Launch** | `opencode` | `newtype` |
| **Config dir** | `~/.config/opencode/` | `~/.config/newtype/` |
| **Project dir** | `.opencode/` | `.newtype/` |
| **npm package** | [@newtype-os/plugin](https://www.npmjs.com/package/@newtype-os/plugin) | [@newtype-os/cli](https://www.npmjs.com/package/@newtype-os/cli) |

Supported platforms: macOS (Apple Silicon & Intel), Linux (x64 & ARM64, glibc & musl), Windows (x64).

## License

Based on [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), follows [SUL-1.0 License](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md).
