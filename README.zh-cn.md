<p align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# newtype-profile

**专为内容创作设计的 AI Agent 协作系统**

基于 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 修改，专注于内容创作场景。

---

## 作者：黄益贺 (huangyihe)

- **YouTube**: [https://www.youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **Twitter**: [https://x.com/huangyihe](https://x.com/huangyihe)
- **Substack**: [https://newtype.pro/](https://newtype.pro/)
- **知识星球**: [https://t.zsxq.com/19IaNz5wK](https://t.zsxq.com/19IaNz5wK)

---

## 项目介绍

newtype-profile 是专为**内容创作**设计的 AI Agent 协作框架：

- 📚 知识库管理与维护
- ✍️ 文章写作与编辑
- 🔍 信息调研与核查
- 📄 文档提取与整理

## 两种使用方式

### 方式 A：Newtype CLI（推荐）

[**Newtype CLI**](https://www.npmjs.com/package/@newtype-os/cli) 是独立的终端 AI 助手，已内置 newtype-profile。无需额外配置插件，安装即用。

```bash
npm install -g @newtype-os/cli
newtype
```

Newtype CLI 基于 [OpenCode](https://github.com/anomalyco/opencode) 定制，预配置了完整的 Agent 团队。

### 方式 B：作为 OpenCode 插件

如果你已在使用 OpenCode，可以将 newtype-profile 作为插件添加：

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

## Agent 团队

| Agent | 角色 | 职责描述 |
|-------|------|---------|
| **chief** | 主编 | 双模式：探讨伙伴 + 执行协调 |
| **deputy** | 副主编 | 执行委派任务 |
| **researcher** | 情报员 | 广度搜索、发现新信息 |
| **fact-checker** | 核查员 | 验证来源、评估可信度 |
| **archivist** | 资料员 | 知识库检索 |
| **extractor** | 格式员 | PDF/图片/文档提取 |
| **writer** | 写手 | 内容生产 |
| **editor** | 编辑 | 内容精炼 |

## 配置模型

创建配置文件来自定义各 Agent 使用的模型：

- **Newtype CLI**：`~/.config/newtype/newtype-profile.json`
- **OpenCode 插件**：`~/.config/opencode/newtype-profile.json`

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

全部 8 个 Agent（`chief`、`deputy`、`researcher`、`fact-checker`、`archivist`、`extractor`、`writer`、`editor`）均可独立配置。

<details>
<summary>可选：Google Antigravity OAuth</summary>

如果使用 Google Antigravity 作为模型提供商，添加 `google_auth`：

```json
{
  "google_auth": true,
  "agents": {
    "chief": { "model": "google/antigravity-claude-opus-4-5-thinking-high" }
  }
}
```

然后认证：

```bash
opencode auth login
# 选择 Provider: Google
# 选择 Login method: OAuth with Google (Antigravity)
```

</details>

## 使用方式

### 三层架构

```
用户 ↔ Chief (主编)
           ↓ chief_task
       Deputy (副主编)
           ↓ chief_task
       专业 Agent (researcher, writer, editor...)
```

**你只需要与 Chief 对话**：

- **模式 1 - 思考伙伴**：Chief 和你一起思考，挑战有问题的逻辑
- **模式 2 - 执行协调**：Chief 分解任务、委派执行、交付成果

### 对话示例

```
"帮我了解一下2024年AI发展趋势"
"根据我们的调研写一篇文章"
"验证这份文档中的来源"
```

## 自定义

### SOUL.md - 自定义 Chief 人格 (v1.0.60+)

Chief 的人格分三层：
- **底层能力**（硬编码）：Chief 能做什么
- **里人格**（硬编码）：核心价值观和思维方式
- **表人格**（可自定义）：沟通风格

创建 `.opencode/SOUL.md`（Newtype CLI 为 `.newtype/SOUL.md`）来自定义 Chief 的沟通风格：

```bash
/init-soul  # 创建默认 SOUL.md 模板
```

可自定义内容：
- 让 Chief 更正式或更随意
- 调整语言偏好
- 改变直接程度

修改后重启生效。

### 内置 Skills

| 技能 | 命令 | 说明 |
|------|------|------|
| **super-analyst** | `/super-analyst` | 12 个分析框架 + 调研方法论 |
| **super-writer** | `/super-writer` | 6 种写作方法论（W.R.I.T.E、AIDA 等） |
| **super-fact-checker** | `/super-fact-checker` | 声明核查 + 来源可信度评估 |
| **super-editor** | `/super-editor` | 四层编辑：结构 → 段落 → 句子 → 词语 |
| **super-interviewer** | `/super-interviewer` | 对话技巧，用于探索 |
| **playwright** | `/playwright` | 浏览器自动化 |

Chief 在任务需要时自动加载技能。

### MCP 服务器

内置 MCP：

| MCP | 默认状态 | 配置 |
|-----|----------|------|
| **websearch** (Exa) | 已启用 | 无 |
| **sequential-thinking** | 已启用 | 无 |
| **tavily** | 未启用 | `api_key` |
| **firecrawl** | 未启用 | `api_key` |

### 禁用功能

```json
{
  "disabled_agents": ["fact-checker"],
  "disabled_skills": ["super-analyst"],
  "disabled_hooks": ["memory-system"],
  "disabled_mcps": ["sequential-thinking"]
}
```

## 记忆系统

自动保存对话摘要到 `.opencode/memory/`（Newtype CLI 为 `.newtype/memory/`）：
- 每日摘要（LLM 生成）
- 每个 session 的完整记录
- 7 天后自动归档到 `MEMORY.md`

使用 `/memory-consolidate` 手动触发整理。

## 其他功能

- **后台任务**：并行运行多个 Agent
- **会话恢复**：自动从错误中恢复
- **启动配置检查**：首次运行时引导模型设置
- **插件切换**：`/switch newtype` / `/switch omo` / `/switch none`

## Newtype CLI

[Newtype CLI](https://www.npmjs.com/package/@newtype-os/cli) 是独立产品，将 newtype-profile 打包为开箱即用的终端 AI 助手。

| | newtype-profile（插件） | Newtype CLI |
|---|---|---|
| **安装** | 在 OpenCode 中 `bun add @newtype-os/plugin` | `npm install -g @newtype-os/cli` |
| **依赖** | 需要单独安装 OpenCode | 无需其他依赖，自包含 |
| **启动** | `opencode` | `newtype` |
| **配置目录** | `~/.config/opencode/` | `~/.config/newtype/` |
| **项目目录** | `.opencode/` | `.newtype/` |
| **npm 包** | [@newtype-os/plugin](https://www.npmjs.com/package/@newtype-os/plugin) | [@newtype-os/cli](https://www.npmjs.com/package/@newtype-os/cli) |

支持平台：macOS（Apple Silicon 和 Intel）、Linux（x64 和 ARM64，glibc 和 musl）、Windows（x64）。

## 许可证

基于 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 修改，遵循 [SUL-1.0 许可证](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md)。
