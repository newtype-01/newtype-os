<p align="right">
  <strong>English</strong> | <a href="./README.zh-cn.md">简体中文</a>
</p>

# newtype OS

**An AI content team for research, writing, editing, and knowledge work.**

Created by [huangyihe](https://x.com/huangyihe).

<p>
  <a href="https://github.com/newtype-01/newtype-os/releases/download/workstation-latest/newtype-workstation-mac-arm64.dmg"><strong>Download newtype Workstation</strong></a>
  ·
  <a href="#newtype-cli"><strong>Install newtype CLI</strong></a>
  ·
  <a href="#opencode-plugin"><strong>Use the open-source plugin</strong></a>
</p>

<p>
  <a href="https://www.npmjs.com/package/@newtype-os/cli"><img src="https://img.shields.io/npm/v/@newtype-os/cli?label=%40newtype-os%2Fcli" alt="@newtype-os/cli version" /></a>
  <a href="https://www.npmjs.com/package/@newtype-os/plugin"><img src="https://img.shields.io/npm/v/@newtype-os/plugin?label=%40newtype-os%2Fplugin" alt="@newtype-os/plugin version" /></a>
  <img src="https://img.shields.io/badge/plugin-maintenance%20mode-6b7280" alt="Plugin maintenance mode" />
</p>

[![newtype Workstation — AI content team](./assets/social-preview.png)](https://os.newtype.pro/)

> **Which version should I use?**
>
> - **Apple Silicon Mac:** choose **newtype Workstation** for the complete native workspace.
> - **Windows, Linux, Intel Mac, or terminal-first workflows:** choose **newtype CLI**.
> - **Existing OpenCode users:** use the open-source **`@newtype-os/plugin`** compatibility edition.

> **Repository scope:** This repository contains the open-source `@newtype-os/plugin` code and hosts official newtype Workstation release binaries. The source code for newtype Workstation and the integrated CLI is not included here.

## What is newtype OS?

newtype OS is an **8-agent, multi-layer orchestration system built for content production**. Think of it as a content team that can research, verify, retrieve, extract, write, and edit alongside you.

```text
You ↔ Chief (Editor-in-Chief)
          ↓
      Deputy (Deputy Editor)
          ↓
      Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor
```

You work with Chief. Chief clarifies the goal and coordinates the specialists required for the task.

## Choose your version

| Product | Best for | Development status | Source in this repository |
| --- | --- | --- | --- |
| **newtype Workstation** | Apple Silicon Mac users who want a native content workspace | Active development | No |
| **newtype CLI** | Cross-platform and terminal-first users | Active development | No |
| **OpenCode plugin** | Existing OpenCode users | Maintenance mode | Yes |

The products share the same newtype agent-team lineage, but they are no longer presented as permanently feature-identical. New product development is focused on newtype Workstation and newtype CLI. The OpenCode plugin remains available for existing users and receives necessary compatibility, security, and critical fixes.

## Install

### newtype Workstation

A native Mac content workspace with a Ulysses-inspired three-column writing interface, Markdown editing and preview, and a separate floating newtype OS terminal.

[**Download newtype Workstation 0.3.14 for Apple Silicon**](https://github.com/newtype-01/newtype-os/releases/download/workstation-latest/newtype-workstation-mac-arm64.dmg)

Requirements: Apple Silicon (M1 or later) and macOS 11.5 or later.

> This build is ad-hoc signed and has not been notarized by Apple. macOS may require you to choose **Open Anyway** in **System Settings → Privacy & Security** after the first launch attempt. Download it only from this GitHub repository and verify the published SHA-256.

Open the DMG and drag `newtype Workstation` into Applications. Automatic updates are not enabled for this build.

[View Workstation release history](https://github.com/newtype-01/newtype-os/releases?q=workstation-v)

### newtype CLI

A self-contained, cross-platform terminal application with the full newtype agent team.

```bash
npm install -g @newtype-os/cli
nt
```

The CLI uses `~/.config/newtype/` for global configuration and `.newtype/` for project data. It does not modify your OpenCode configuration.

To teach supported AI coding tools how to invoke newtype commands:

```bash
nt init
```

Supported tools include Claude Code, Cursor, Copilot, Windsurf, Cline, Roo Code, Zed, Goose, and Amazon Q.

### OpenCode plugin

If you already use [OpenCode](https://github.com/anomalyco/opencode):

```bash
cd ~/.config/opencode
bun add @newtype-os/plugin
```

Add the plugin to `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["newtype-profile"]
}
```

The plugin uses OpenCode's `~/.config/opencode/` and `.opencode/` namespaces.

See the [plugin guide](./docs/plugin-guide.md) for configuration and development details. Read the [maintenance policy](./MAINTENANCE.md) before proposing substantial plugin features.

## The agent team

| Agent | Role | Responsibility |
| --- | --- | --- |
| **Chief** | Editor-in-Chief | Thought partner and primary task coordinator |
| **Deputy** | Deputy Editor | Dispatches execution to the specialist team |
| **Researcher** | Researcher | External research and trend discovery |
| **Fact-Checker** | Verifier | Claim verification and source assessment |
| **Archivist** | Archivist | Internal knowledge retrieval and correlation |
| **Extractor** | Extractor | Extracts content from documents, images, and web pages |
| **Writer** | Writer | Produces structured drafts from goals and materials |
| **Editor** | Editor | Improves logic, clarity, tone, and consistency |

## Core capabilities

- Multi-agent research, writing, fact-checking, and editing
- Specialized content-production skills and quality gates
- Automatic session summaries and long-term memory
- Project knowledge-base initialization and retrieval
- Configurable models for individual agents
- Command-line workflows for both humans and agents
- Optional MCP integrations

Detailed CLI, orchestration, and skill documentation:

- [CLI guide](./docs/cli-guide.md)
- [Orchestration guide](./docs/orchestration-guide.md)
- [Category and skill guide](./docs/category-skill-guide.md)
- [OpenCode plugin guide](./docs/plugin-guide.md)

## Maintenance and contributions

`@newtype-os/plugin` is in **maintenance mode**. We welcome focused compatibility, security, documentation, and critical bug fixes. New product development is concentrated in newtype Workstation and newtype CLI.

Before opening a pull request, read:

- [Maintenance policy](./MAINTENANCE.md)
- [Contributing guide](./CONTRIBUTING.md)

## Project history

newtype OS began as a fork of [oh-my-opencode, now oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent), and evolved through extensive customization for content-production workflows. It later expanded into an integrated CLI and a native Workstation. The fork relationship and upstream attribution are intentionally preserved as part of the project's open-source lineage.

## Links

- **Website:** [os.newtype.pro](https://os.newtype.pro/)
- **Workstation releases:** [GitHub Releases](https://github.com/newtype-01/newtype-os/releases?q=workstation-v)
- **YouTube:** [youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **X:** [x.com/huangyihe](https://x.com/huangyihe)
- **Substack:** [newtype.pro](https://newtype.pro/)

## License

Based on [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) and distributed under the [SUL-1.0 License](./LICENSE.md).
