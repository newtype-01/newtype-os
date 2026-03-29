# NEWTYPE-PROFILE KNOWLEDGE BASE

**AI Agent Collaboration System for Content Creation** - Based on oh-my-opencode, redesigned for editorial team workflows.

## BUILD & TEST COMMANDS

```bash
bun install           # Install dependencies (bun only - never npm/yarn)
bun run build         # Full build: ESM + declarations + schema
bun run typecheck     # Type check only
bun test              # Run all tests
bun test chief        # Run tests matching "chief"
bun test path/to.test.ts  # Run single test file
```

## PROJECT STRUCTURE

```
src/
├── agents/      # 8 agents: chief, deputy, researcher, fact-checker, archivist, extractor, writer, editor
├── hooks/       # Lifecycle hooks (chief-orchestrator, comment-checker, etc.)
│   └── chief-orchestrator/  # Main orchestration with quality scoring
├── tools/       # LSP, AST-Grep, Grep, Glob, chief-task, skill
├── features/    # Background agents, skill loaders, context injector
├── auth/        # Google Antigravity OAuth
├── config/      # Zod schemas and TypeScript types
├── mcp/         # MCP server configs (exa, tavily, firecrawl)
└── index.ts     # Main plugin entry
```

## THREE-LAYER ARCHITECTURE (v1.0.22+)

```
┌─────────────────────────────────────────────────────────┐
│                    Chief (Opus 4.5)                     │
│                   思考者 / Thinker                       │
│  • 与用户对话，理解需求                                   │
│  • 高层任务拆解、最终审核与交付                           │
│  • 工具白名单限制 — 只能用 chief_task 委派执行            │
└─────────────────────┬───────────────────────────────────┘
                      │ chief_task(subagent_type="deputy")
                      ↓
┌─────────────────────────────────────────────────────────┐
│                   Deputy (Sonnet 4.5)                   │
│                   执行者 / Doer                          │
│  • 接收 Chief 的精简指令，拆解复杂任务                    │
│  • 调度专业 Agents，汇总过滤输出                         │
│  • 协作语气，永不拒绝任务                                │
└─────────────────────┬───────────────────────────────────┘
                      │ chief_task(subagent_type="researcher/writer/...")
                      ↓
┌─────────────────────────────────────────────────────────┐
│              Specialists (Gemini/Sonnet)                │
│  researcher, writer, fact-checker, editor, etc.        │
│  执行具体任务，不评判任务本身                            │
└─────────────────────────────────────────────────────────┘
```

## CHIEF TOOL WHITELIST (v1.0.26+)

Chief 使用**白名单**限制工具访问，阻止所有未列出的工具（包括用户安装的 MCP）：

| 分类 | 允许的工具 |
|------|-----------|
| 执行路径 | `chief_task` |
| 任务管理 | `todowrite`, `todoread` |
| 只读文件 | `read`, `glob`, `grep` |
| LSP 只读 | `lsp_hover`, `lsp_goto_definition`, `lsp_find_references`, `lsp_document_symbols`, `lsp_workspace_symbols`, `lsp_diagnostics`, `lsp_servers`, `lsp_code_actions` |
| Session | `session_list`, `session_read`, `session_search`, `session_info` |
| 后台管理 | `background_output`, `background_cancel` |
| 其他 | `look_at`, `skill`, `slashcommand` |

**被阻止的工具**：所有 MCP 工具、`write`/`edit`、`bash`、`ast_grep_replace`、`lsp_rename` 等

## AGENT PROMPTS 语气原则 (v1.0.27+)

Deputy 和专业 Agents 必须遵循**协作语气**：

**禁止措辞**：
- ❌ "我拒绝..." / "I refuse..."
- ❌ "这个任务太复杂..."
- ❌ "定义过于严格..."
- ❌ "PROVIDE EXACTLY ONE TASK"

**正确行为**：
- ✅ 直接执行任务，不评判任务本身
- ✅ 复杂任务直接拆解，不解释为什么需要拆解
- ✅ 协作，不对抗

## CODE STYLE

### Imports
```typescript
// External first, then internal with relative paths
import type { Plugin } from "@opencode-ai/plugin"
import { existsSync } from "node:fs"
import { log } from "../../shared/logger"
import type { AgentConfig } from "./types"
```

### Naming
| Element | Convention | Example |
|---------|------------|---------|
| Directories/Files | kebab-case | `chief-orchestrator/`, `quality-dimensions.ts` |
| Hook creators | `createXXXHook` | `createChiefOrchestratorHook()` |
| Agent factories | `createXXXAgent` | `createChiefAgent()` |
| Constants | UPPER_SNAKE | `DEFAULT_MODEL`, `HOOK_NAME` |
| Types | PascalCase | `AgentConfig`, `QualityScores` |

### Error Handling
```typescript
try {
  const result = await someAsyncOperation()
} catch (error) {
  log.error("Operation failed:", error)
  throw error
}
// NEVER: empty catch {}, as any, @ts-ignore, @ts-expect-error
```

## TESTING

Test files: `*.test.ts` alongside source. BDD comments: `#given`, `#when`, `#then`

```typescript
import { describe, test, expect } from "bun:test"

describe("QualityDimensions", () => {
  test("should parse multi-dimensional scores", () => {
    // #given
    const output = "**QUALITY SCORES:**\n- Coverage: 0.85\n**OVERALL: 0.70**"
    // #when
    const result = parseQualityScores(output, "researcher")
    // #then
    expect(result.overall).toBe(0.70)
  })
})
```

## ANTI-PATTERNS

| Forbidden | Use Instead |
|-----------|-------------|
| `npm` / `yarn` | `bun` |
| `@types/node` | `bun-types` |
| `as any`, `@ts-ignore` | Proper typing |
| Empty `catch {}` | Log and handle errors |
| `Bun.spawn` | `node:child_process` |
| Direct `npm publish` | `npm version patch && npm publish` |

## RUNTIME COMPATIBILITY (CRITICAL)

**OpenCode loads plugins using a runtime that may not support Bun-specific APIs.**

```typescript
// ❌ WRONG - causes plugin load failure
Bun.spawn([...])
Bun.write(path, data)

// ✅ CORRECT - works in both Bun and Node.js
import { spawn } from "node:child_process"
import { writeFile } from "node:fs/promises"
```

## STANDALONE PLUGIN vs EMBEDDED PLUGIN (CRITICAL)

newtype-profile 存在两个版本，代码已经产生差异，**不能混用**：

| | 独立插件 (本仓库) | 内嵌插件 (newtype-cli) |
|---|---|---|
| **仓库** | `newtype-profile` | `newtype-cli/packages/newtype-profile/` |
| **本地文件夹** | `newtype-plugin`（原 `newtype-profile`） | `newtype-os`（原 `newtype-cli`） |
| **用途** | 作为 OpenCode 插件安装 | 内嵌在 Newtype CLI 产品中 |
| **配置路径** | `~/.config/opencode/newtype-profile.json` | `~/.config/newtype/newtype-profile.json` |
| **项目路径** | `<project>/.opencode/` | `<project>/.newtype/` |
| **品牌文案** | 保持 OpenCode 相关措辞 | 所有用户可见文案改为 "Newtype" |
| **config scope** | `"opencode"` | `"newtype"` |
| **发布方式** | `npm publish` 独立发布 | 随 newtype-cli CI 一起构建 |

### 已产生的代码差异 (v0.0.4+)

内嵌版相比独立版，做了以下品牌化修改：

1. **`src/plugin-config.ts`** — config scope 从 `"opencode"` 改为 `"newtype"`
2. **`src/agents/chief.ts`** — prompt 中的路径引用 `.opencode/` → `.newtype/`（4 处）
3. **`src/cli/install.ts`** — CLI 指令提示 `"Run opencode"` → `"Run newtype"`

### 同步规则

- `sync-plugin.yml` 会从本仓库同步到 newtype-cli，但**同步后需要重新应用上述品牌化修改**
- 修改独立插件的功能代码时，不需要考虑 newtype-cli 的品牌差异
- 修改 newtype-cli 内嵌版时，**只在 newtype-cli 仓库操作，不要修改本仓库**

## CONFIGURATION

### As standalone plugin (in OpenCode)

**User**: `~/.config/opencode/newtype-profile.json`
**Project**: `<project>/.opencode/newtype-profile.json`

### As embedded plugin (in Newtype CLI)

**User**: `~/.config/newtype/newtype-profile.json`
**Project**: `<project>/.newtype/newtype-profile.json`

### Config format

```json
{
  "agents": {
    "chief": { "model": "your-preferred-model" },
    "deputy": { "model": "your-preferred-model" },
    "writer": { "model": "your-preferred-model", "temperature": 0.7 }
  }
}
```

Optional fields:
- `google_auth: true` — Only needed for Google Antigravity OAuth provider
- `agents` — Override default models for any of the 8 agents

## DEPLOYMENT

### newtype-profile (standalone plugin)

```bash
npm version patch   # Bump version
npm publish --access public --otp=<code>
git push origin main --follow-tags
```

### newtype-cli (fork product)

Publish via GitHub Actions workflow `publish-newtype.yml`:
1. Go to https://github.com/newtype-01/newtype-cli/actions/workflows/publish-newtype.yml
2. Click "Run workflow" → select bump type (patch/minor/major) or override version
3. CI builds all 12 platform binaries + 1 wrapper package → publishes to npm automatically

Manual version override: use the `version` input field (e.g. `0.0.3`)

## NEWTYPE-CLI (FORK PRODUCT)

### Overview

newtype-cli is a **shallow fork of OpenCode** (anomalyco/opencode), white-labeled as "Newtype" with newtype-profile embedded.

| Aspect | Detail |
|--------|--------|
| npm package | `newtype-cli` |
| GitHub repo | `newtype-01/newtype-cli` (private) |
| CLI command | `newtype` |
| User config dir | `~/.config/newtype/` |
| Project config dir | `<project>/.newtype/` |
| OpenCode config dir | `~/.config/opencode/` (kept for backward compat) |
| Env vars | `OPENCODE_*` kept for backward compatibility |
| Import packages | `@opencode-ai/*` unchanged |
| Base version | OpenCode v1.2.4 (commit `eb553f5`) |

### Installation

```bash
npm install -g newtype-cli
newtype          # Launch
newtype --version
newtype --help
```

### Repository Structure

```
newtype-cli/                          # Fork of anomalyco/opencode (local folder: newtype-os)
├── packages/opencode/                # Core CLI (name=newtype-cli, bin=newtype)
│   ├── src/global/index.ts           # app = "newtype"
│   ├── src/config/config.ts          # .newtype/ dirs
│   ├── src/plugin/index.ts           # INTERNAL_PLUGINS includes NewtypeProfilePlugin
│   ├── src/cli/logo.ts               # ASCII art "NEWTYPE"
│   └── script/
│       ├── build.ts                  # Builds 12 platform binaries
│       ├── publish.ts                # Packs + publishes to npm
│       └── postinstall.mjs           # Platform binary resolution
├── packages/newtype-profile/         # Embedded plugin (440+ files)
├── packages/script/src/index.ts      # @opencode-ai/script — version from npm registry
├── script/
│   ├── publish.ts                    # Root publish orchestrator
│   ├── version.ts                    # Version determination
│   └── local-publish.sh             # Manual OTP-based publish (fallback)
└── .github/workflows/
    ├── publish-newtype.yml           # CI publish (auto npm publish)
    ├── sync-upstream.yml             # Weekly upstream sync from anomalyco/opencode
    └── sync-plugin.yml              # Manual plugin sync from newtype-profile
```

### npm Package Architecture

13 packages total: 12 platform binaries + 1 wrapper

| Package | Platform |
|---------|----------|
| `newtype-cli` | Wrapper (optionalDependencies → platform pkgs) |
| `newtype-cli-darwin-arm64` | macOS Apple Silicon |
| `newtype-cli-darwin-x64` | macOS Intel |
| `newtype-cli-darwin-x64-baseline` | macOS Intel (no AVX2) |
| `newtype-cli-linux-arm64` | Linux ARM64 |
| `newtype-cli-linux-x64` | Linux x64 |
| `newtype-cli-linux-x64-baseline` | Linux x64 (no AVX2) |
| `newtype-cli-linux-arm64-musl` | Linux ARM64 musl (Alpine) |
| `newtype-cli-linux-x64-musl` | Linux x64 musl |
| `newtype-cli-linux-x64-musl-baseline` | Linux x64 musl (no AVX2) |
| `newtype-cli-windows-x64` | Windows x64 |
| `newtype-cli-windows-x64-baseline` | Windows x64 (no AVX2) |

### Publishing Lessons Learned

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `EOTP` error | npm Granular Access Token requires OTP even with 2FA disabled | Create token with "bypass 2FA" enabled |
| `E403 Two-factor authentication required` | Granular token missing bypass 2FA permission | Recreate token with bypass 2FA checkbox |
| `cannot publish over previously published version` | Partial publish left some packages at old version | Added `.nothrow()` + "already published" tolerance in publish script |
| `ENEEDAUTH` | `.npmrc` had literal `${NODE_AUTH_TOKEN}` | Read `process.env.NODE_AUTH_TOKEN` in script, write real token |
| `nothing to commit` | Release commit idempotency | `git diff --cached --quiet \|\|` guard |
| `bad revision 'v1.2.4..HEAD'` | Upstream tag references in changelog | Simplified version.ts, removed changelog |
| `stale tag` | Failed run left orphan tag | `git tag -f` + `git push origin <tag> --force` |
| npm Classic Automation Token unavailable | npm account had 2FA enabled | Disable 2FA first, or use Granular token with bypass 2FA |

### CI/CD Accounts & Secrets

| Resource | Value |
|----------|-------|
| GitHub org | `newtype-01` |
| npm account | `huangyihe` |
| GitHub secret `NPM_TOKEN` | Granular Access Token with bypass 2FA, read+write packages |
| Git committer (CI) | `newtype-bot <bot@newtype.dev>` |

### Current Published Version

- **v0.0.2** — First successful full publish (2026-02-16)
- v0.0.1 — Partial publish (4 platform packages only, orphaned)

## RECENT CHANGES (v1.0.22 - v1.0.29)

| Version | Change |
|---------|--------|
| v1.0.29 | Fix Deputy not executing file edits — add explicit direct execution guidance to prompt |
| v1.0.28 | Remove confrontational `SINGLE_TASK_DIRECTIVE` from hooks |
| v1.0.27 | Add forbidden phrases to Deputy prompt |
| v1.0.26 | Chief uses whitelist (not blocklist) for tool restrictions |
| v1.0.25 | Fix MCP tool names, improve Deputy task decomposition |
| v1.0.24 | Add hard tool constraints to Chief |
| v1.0.23 | Remove `call_omo_agent`, unify to `chief_task` |
| v1.0.22 | Implement three-layer architecture with Deputy |
