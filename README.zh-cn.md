<p align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# newtype OS

**一个用于调研、写作、编辑与知识工作的 AI 内容团队。**

由 [huangyihe（黄益贺）](https://x.com/huangyihe) 创作。

<p>
  <a href="https://github.com/newtype-01/newtype-os/releases/download/workstation-latest/newtype-workstation-mac-arm64.dmg"><strong>下载 newtype Workstation</strong></a>
  ·
  <a href="#newtype-cli"><strong>安装 newtype CLI</strong></a>
  ·
  <a href="#opencode-插件"><strong>使用开源插件版</strong></a>
</p>

<p>
  <a href="https://www.npmjs.com/package/@newtype-os/cli"><img src="https://img.shields.io/npm/v/@newtype-os/cli?label=%40newtype-os%2Fcli" alt="@newtype-os/cli 版本" /></a>
  <a href="https://www.npmjs.com/package/@newtype-os/plugin"><img src="https://img.shields.io/npm/v/@newtype-os/plugin?label=%40newtype-os%2Fplugin" alt="@newtype-os/plugin 版本" /></a>
  <img src="https://img.shields.io/badge/plugin-maintenance%20mode-6b7280" alt="插件维护模式" />
</p>

[![newtype Workstation——AI 内容团队](./assets/social-preview.png)](https://os.newtype.pro/)

> **应该选择哪个版本？**
>
> - **Apple Silicon Mac 用户：**推荐使用完整的原生工作台 **newtype Workstation**。
> - **Windows、Linux、Intel Mac 或终端工作流：**使用 **newtype CLI**。
> - **已经在使用 OpenCode：**可以选择开源兼容版本 **`@newtype-os/plugin`**。

> **仓库范围：**本仓库包含开源的 `@newtype-os/plugin` 插件代码，同时托管 newtype Workstation 官方安装包。本仓库不包含 newtype Workstation 和整合版 CLI 的源代码。

## newtype OS 是什么？

newtype OS 是一套**专为内容生产打造的 8 Agent 多层编排系统**。你可以把它理解为一个与你协作的内容团队，能够完成调研、核查、检索、提取、撰写和编辑。

```text
你 ↔ Chief（主编）
         ↓
     Deputy（副主编）
         ↓
     Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor
```

你只需要与 Chief 协作。Chief 负责理解目标，并协调完成任务所需的专家。

## 选择适合你的版本

| 产品 | 适合谁 | 开发状态 | 本仓库是否包含源码 |
| --- | --- | --- | --- |
| **newtype Workstation** | 希望使用原生内容工作台的 Apple Silicon Mac 用户 | 积极开发 | 否 |
| **newtype CLI** | 跨平台和终端优先的用户 | 积极开发 | 否 |
| **OpenCode 插件** | 已经在使用 OpenCode 的用户 | 维护模式 | 是 |

三个产品来自同一套 newtype Agent 团队体系，但不再承诺永久保持功能完全一致。当前产品开发重点已经转向 newtype Workstation 和 newtype CLI。OpenCode 插件继续面向现有用户开放，并处理必要的兼容性、安全性和关键问题。

## 安装

### newtype Workstation

原生 Mac 内容创作工作台，提供接近 Ulysses 的三栏写作界面、Markdown 编辑与预览，以及独立悬浮的 newtype OS 终端。

[**下载 newtype Workstation 0.3.17 Apple Silicon 版**](https://github.com/newtype-01/newtype-os/releases/download/workstation-latest/newtype-workstation-mac-arm64.dmg)

系统要求：Apple Silicon（M1 或更新芯片），macOS 11.5 或更高版本。

0.3.17（Build 25）内置 newtype CLI 0.0.87。Workstation 和整合版 CLI 现在统一把项目记忆保存在 `.newtype/`，首次运行时一次性导入已有的 `.opencode/` 记忆，并可只读召回最近一级父项目的记忆。

> 这是经过临时签名、尚未通过 Apple 公证的版本。首次尝试启动后，可能需要进入“系统设置 → 隐私与安全性”，点击“仍要打开”。请只从本 GitHub 仓库下载，并核对 Release 中发布的 SHA-256。

SHA-256：`2115c56b1a026917d8fee2e94e0e098e74e669cd53117b4ae6214f21b582fa16`

打开 DMG，将 `newtype Workstation` 拖入“应用程序”文件夹即可。本版本暂不启用自动更新。

[查看 Workstation 历史版本](https://github.com/newtype-01/newtype-os/releases?q=workstation-v)

### newtype CLI

自包含、跨平台的终端应用，内置完整的 newtype Agent 团队。

```bash
npm install -g @newtype-os/cli
nt
```

CLI 使用 `~/.config/newtype/` 保存全局配置，使用 `.newtype/` 保存项目数据，不会修改 OpenCode 配置。

如果希望让本地 AI 编程工具学会调用 newtype 命令：

```bash
nt init
```

支持的工具包括 Claude Code、Cursor、Copilot、Windsurf、Cline、Roo Code、Zed、Goose 和 Amazon Q。

### OpenCode 插件

如果你已经在使用 [OpenCode](https://github.com/anomalyco/opencode)：

```bash
cd ~/.config/opencode
bun add @newtype-os/plugin
```

在 `~/.config/opencode/opencode.json` 中加入：

```json
{
  "plugin": ["newtype-profile"]
}
```

插件使用 OpenCode 的 `~/.config/opencode/` 和 `.opencode/` 命名空间。

配置与开发说明请查看[插件指南](./docs/plugin-guide.md)。提交大型插件功能之前，请先阅读[维护政策](./MAINTENANCE.md)。

## Agent 团队

| Agent | 角色 | 职责 |
| --- | --- | --- |
| **Chief** | 主编 | 思考伙伴与主要任务协调者 |
| **Deputy** | 副主编 | 将任务调度给下游专家 |
| **Researcher** | 研究员 | 外部调研与趋势发现 |
| **Fact-Checker** | 核查员 | 事实核查与来源评估 |
| **Archivist** | 档案员 | 内部知识检索与关联 |
| **Extractor** | 提取专家 | 从文档、图片和网页中提取内容 |
| **Writer** | 写作者 | 根据目标和素材生成结构化初稿 |
| **Editor** | 编辑 | 改善逻辑、清晰度、语气和一致性 |

## 核心能力

- 多 Agent 调研、写作、事实核查和编辑
- 面向内容生产的专业 Skills 与质量门
- 自动会话摘要和长期记忆
- 项目知识库初始化与检索
- 为不同 Agent 分别配置模型
- 同时面向人类和 Agent 的命令行工作流
- 可选的 MCP 集成

详细文档：

- [CLI 指南](./docs/cli-guide.md)
- [编排系统指南](./docs/orchestration-guide.md)
- [内容类型与 Skill 指南](./docs/category-skill-guide.md)
- [OpenCode 插件指南](./docs/plugin-guide.md)

## 维护与贡献

`@newtype-os/plugin` 已进入**维护模式**。我们欢迎范围明确的兼容性、安全性、文档和关键问题修复。新的产品开发主要集中在 newtype Workstation 和 newtype CLI。

提交 Pull Request 前，请阅读：

- [维护政策](./MAINTENANCE.md)
- [贡献指南](./CONTRIBUTING.md)

## 项目历史

newtype OS 最初 fork 自 [oh-my-opencode（现名 oh-my-openagent）](https://github.com/code-yeongyu/oh-my-openagent)，随后围绕内容生产工作流进行了长期定制，并逐步发展出整合版 CLI 和原生 Workstation。我们有意保留 Fork 关系和上游署名，以记录项目的开源谱系。

## 链接

- **官网：**[os.newtype.pro](https://os.newtype.pro/)
- **Workstation 版本：**[GitHub Releases](https://github.com/newtype-01/newtype-os/releases?q=workstation-v)
- **YouTube：**[youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **X：**[x.com/huangyihe](https://x.com/huangyihe)
- **Substack：**[newtype.pro](https://newtype.pro/)

## 许可证

基于 [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)，按照 [SUL-1.0 License](./LICENSE.md) 发布。
