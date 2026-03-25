<p align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# newtype OS

**Multi-Agent Content Team — 为内容生产而生的多 Agent 协作系统**

由 [huangyihe（黄益贺）](https://x.com/huangyihe) 创作。

<p>
  <a href="https://www.npmjs.com/package/@newtype-os/cli"><img src="https://img.shields.io/npm/v/@newtype-os/cli?label=%40newtype-os%2Fcli" /></a>
  <a href="https://www.npmjs.com/package/@newtype-os/plugin"><img src="https://img.shields.io/npm/v/@newtype-os/plugin?label=%40newtype-os%2Fplugin" /></a>
</p>

---

## 这是什么

newtype OS 的内核是一套 **8 Agent 多层编排系统**，配备专业 Skills 和记忆系统，专为内容生产场景打造。

你可以把它理解为：**一个驻扎在终端里的内容团队**。主编（Chief）负责与你对话、拆解需求；副主编（Deputy）调度执行；6 位专家各司其职——调研、核查、检索、提取、撰写、编辑。

```
你 ↔ Chief（主编）
         ↓
     Deputy（副主编）
         ↓
     Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor
```

## 安装与使用

newtype OS 同时面向人类和 Agent。

### 面向人类

#### 方式一：newtype CLI（推荐）

开箱即用的终端 AI 助手，内置完整 Agent 团队。

```bash
npm install -g @newtype-os/cli

# 启动 TUI 交互界面
nt
```

#### 方式二：作为 OpenCode 插件

如果你已在使用 [OpenCode](https://github.com/anomalyco/opencode)：

```bash
cd ~/.config/opencode
bun add @newtype-os/plugin
```

编辑 `~/.config/opencode/opencode.json`：

```json
{
  "plugin": ["newtype-profile"]
}
```

### 面向 Agent

安装 newtype CLI 后，系统内置一整套 CLI 命令（`nt research`、`nt write`、`nt pipeline` 等），专为 Agent 调用设计。

运行 `nt init`，newtype 会自动扫描本地已安装的 AI 开发工具，并注入 Skill 文件，教会 Agent 如何使用这些 CLI 命令：

```bash
npm install -g @newtype-os/cli
nt init
```

支持自动检测的工具：Claude Code、Cursor、Copilot、Windsurf、Cline、Roo Code、Zed、Goose、Amazon Q 等。

注入后，这些 Agent 就知道何时以及如何调用 `nt research`、`nt pipeline` 等命令来增强自身能力。

## Agent 团队

| Agent | 角色 | 职责 |
|-------|------|------|
| **Chief** | 主编 | 你的对话入口——思考伙伴 + 任务协调 |
| **Deputy** | 副主编 | Chief 的执行层，调度下游专家 |
| **Researcher** | 研究员 | 外部情报搜集、趋势发现 |
| **Fact-Checker** | 核查员 | 事实验证、来源可信度评估 |
| **Archivist** | 档案员 | 内部知识库检索与关联 |
| **Extractor** | 提取员 | PDF/图片/网页内容提取，转为 Markdown |
| **Writer** | 撰稿人 | 将素材转化为结构化初稿 |
| **Editor** | 编辑 | 语言润色、逻辑加固、风格统一 |

**你只需要与 Chief 对话。** Chief 会根据需要自动调度其他 Agent。

## 内置 Skills

Agent 在执行任务时会自动加载对应的 Skill 框架：

| Skill | 命令 | 说明 |
|-------|------|------|
| **Super Analyst** | `/super-analyst` | 12 种分析框架（SWOT、波特五力、第一性原理等） |
| **Super Writer** | `/super-writer` | 6 种写作方法论（W.R.I.T.E、AIDA、叙事等） |
| **Super Fact-Checker** | `/super-fact-checker` | 系统化事实核查 + 来源可信度评估 |
| **Super Editor** | `/super-editor` | 四层编辑：结构 → 段落 → 句子 → 用词 |
| **Super Interviewer** | `/super-interviewer` | 深度对话技巧，用于需求挖掘和头脑风暴 |

Chief 在任务需要结构化框架时会自动加载对应 Skill，你也可以通过斜杠命令手动触发。

## CLI 命令

除了 TUI 交互界面，newtype 还提供一组面向命令行和 AI Agent 调用的专业命令（均支持 `--json` 输出）：

| 命令 | 调度的 Agent | 说明 |
|------|-------------|------|
| `nt research [topic]` | Researcher + Fact-Checker | 深度调研 + 来源验证 |
| `nt write [topic]` | Writer | 多风格内容生成 |
| `nt edit [file]` | Editor | 四层内容精修 |
| `nt fact-check [topic]` | Fact-Checker | 事实核查与交叉验证 |
| `nt analyze [topic]` | Chief + Researcher | 基于框架的结构化分析 |
| `nt extract` | Extractor | 从文件/URL/图片提取内容 |
| `nt archive <action>` | Archivist | 知识库存取与语义搜索 |
| `nt pipeline [topic]` | 全流程编排 | Research → Analyze → Write → Fact-check → Edit |

示例：

```bash
# 研究一个主题并输出报告
nt research "AI Agent 架构趋势 2026" -o research.md

# 基于调研结果写文章
nt write --input research.md --style newsletter -o draft.md

# 全流程一键执行
nt pipeline "MCP 协议的未来" --style essay --output-dir ./output/
```

## 微信集成

newtype CLI 内置了 [WeClaw](https://github.com/fastclaw-ai/weclaw) 集成，通过 [ACP（Agent Client Protocol）](https://github.com/nicepkg/acp) 将你的微信与完整 Agent 团队打通。在微信里给自己发一条消息，Chief 就会接手处理——调研、写作、核查，全部在微信完成。

| 命令 | 说明 |
|------|------|
| `nt wechat setup` | 下载 WeClaw 二进制文件 + 扫码绑定微信 |
| `nt wechat start` | 启动微信 Agent 桥接（启动前自动检测更新） |
| `nt wechat stop` | 停止微信 Agent 桥接 |
| `nt wechat status` | 查看已安装版本和运行状态 |

快速开始：

```bash
nt wechat setup    # 首次：下载 + 扫码登录
nt wechat start    # 启动桥接守护进程
```

桥接进程在后台运行。微信消息通过 newtype 的 ACP 服务器路由，使用你配置的模型调度 Chief 处理。微信端无需 API Key——使用的是微信官方 [iLink API](https://ilinkai.weixin.qq.com)。

## 记忆系统

newtype 内置自动记忆系统，无需手动管理：

- **每日摘要**：会话空闲后自动生成 LLM 摘要，存储于 `.newtype/memory/YYYY-MM-DD.md`
- **完整记录**：每个会话的全量对话保存在 `.newtype/memory/full/`
- **长期记忆**：每 7 天自动将旧日志归档到 `.newtype/MEMORY.md`
- **自动召回**：对话时自动检索相关记忆注入上下文，无需重复说明

使用 `/memory-consolidate` 可手动触发归档。

## 知识库

newtype 提供两层知识库初始化命令，帮助 Agent 快速理解项目：

| 命令 | 生成文件 | 说明 |
|------|---------|------|
| `/init` | `AGENTS.md` | 项目级指令文件，定义 Agent 在当前项目中的行为规范和上下文 |
| `/init-deep` | `KNOWLEDGE.md` | 深度知识索引，自动扫描项目结构并生成详细的代码库地图 |

## 配置

### 连接模型供应商

在 TUI 中使用 `/connect` 命令连接模型供应商（支持 75+ 家），或通过命令行：

```bash
nt auth login
```

### 配置 Agent 模型

**方式一**：在 TUI 中使用 `/agent-models` 命令，在界面中为各个 Agent 配置模型。

**方式二**：直接编辑配置文件。

- newtype CLI：`~/.config/newtype/newtype-profile.json`
- OpenCode 插件：`~/.config/opencode/newtype-profile.json`

```json
{
  "agents": {
    "chief": { "model": "你偏好的模型" },
    "deputy": { "model": "你偏好的模型" },
    "researcher": { "model": "你偏好的模型" },
    "writer": { "model": "你偏好的模型", "temperature": 0.7 }
  }
}
```

全部 8 个 Agent 均可独立配置模型和参数。

### MCP 服务器

| MCP | 默认状态 | 配置 |
|-----|---------|------|
| **websearch**（Exa） | 已启用 | 无需配置 |
| **sequential-thinking** | 已启用 | 无需配置 |
| **tavily** | 未启用 | 需要 `api_key` |
| **firecrawl** | 未启用 | 需要 `api_key` |

### 自定义 Chief 人格

创建 `.newtype/SOUL.md`（OpenCode 插件为 `.opencode/SOUL.md`）来定制 Chief 的沟通风格：

```bash
/init-soul  # 生成默认模板
```

### 禁用特定功能

```json
{
  "disabled_agents": ["fact-checker"],
  "disabled_skills": ["super-analyst"],
  "disabled_hooks": ["memory-system"],
  "disabled_mcps": ["sequential-thinking"]
}
```

## 对比

| | @newtype-os/plugin（插件） | @newtype-os/cli（CLI） |
|---|---|---|
| **性质** | OpenCode 插件，开源 | 独立终端应用，闭源 |
| **安装** | `bun add @newtype-os/plugin` | `npm install -g @newtype-os/cli` |
| **依赖** | 需要 OpenCode | 自包含，无需其他依赖 |
| **启动** | `opencode` | `nt` |
| **配置目录** | `~/.config/opencode/` | `~/.config/newtype/` |
| **项目目录** | `.opencode/` | `.newtype/` |

支持平台：macOS（Apple Silicon / Intel）、Linux（x64 / ARM64）、Windows（x64）。

## 链接

- **YouTube**: [youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **Twitter**: [x.com/huangyihe](https://x.com/huangyihe)
- **Substack**: [newtype.pro](https://newtype.pro/)
- **知识星球**: [t.zsxq.com/19IaNz5wK](https://t.zsxq.com/19IaNz5wK)

## 许可证

基于 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)，遵循 [SUL-1.0 许可证](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md)。
