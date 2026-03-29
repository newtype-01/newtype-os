import type { BuiltinSkill } from "./types";

const playwrightSkill: BuiltinSkill = {
  name: "playwright",
  description:
    "MUST USE for any browser-related tasks. Browser automation via Playwright MCP - verification, browsing, information gathering, web scraping, testing, screenshots, and all browser interactions.",
  template: `# Playwright Browser Automation

This skill provides browser automation capabilities via the Playwright MCP server.`,
  mcpConfig: {
    playwright: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
  },
};

const superAnalystSkill: BuiltinSkill = {
  name: "super-analyst",
  description:
    "Professional analysis and research assistant with 12 frameworks (SWOT, Porter's Five Forces, First Principles, etc.) plus systematic research methodology. Auto-detects complexity: simple questions get direct answers, complex ones get structured multi-framework analysis with rigorous research.",
  template: `# Super Analyst

> 判断复杂度 → 系统化调研 → 选框架分析 → 输出结论

---

## 工作流程

\`\`\`
问题 → 复杂度判断 → [简单] 直接回答
                  → [中等] 选1框架 + 基础调研
                  → [复杂] 组合框架 + 深度调研
\`\`\`

**核心原则**：
- 简单问题直接答，不走流程
- 框架是工具，不是仪式
- 调研讲方法，不是堆数量
- Sequential Thinking 是可选的深度思考工具，不强制

---

## 复杂度判断

### 简单（直接回答）
- 概念解释："什么是 SWOT？"
- 单一维度问题
- 用户已提供完整信息
- **处理**：直接回答，不用框架

### 中等（选 1 个框架）
- 需要一定外部信息
- 2-3 个分析维度
- 范围清晰
- 例："分析特斯拉的竞争优势"
- **处理**：基础调研 + 1 个框架

### 复杂（组合框架）
- 需要深度研究
- 多维度战略决策
- 例："我们是否应该进入印度市场？"
- **处理**：深度调研 + 2-3 个框架组合

---

## 调研方法论

### 信息分层（优先级从高到低）

| 层级 | 类型 | 可信度 | 示例 |
|------|------|--------|------|
| 一手源 | 原始数据、官方声明、当事人陈述 | ⭐⭐⭐ | 财报、官方公告、法院文件、专利 |
| 二手源 | 对一手源的分析和解读 | ⭐⭐ | 学术论文、权威媒体深度报道、行业报告 |
| 三手源 | 对二手源的引用和转述 | ⭐ | 自媒体文章、新闻聚合、百科条目 |

**原则**：尽可能追溯到一手源，对三手源保持警惕。

### 来源可信度评估

| 来源类型 | 可信度 | 使用建议 |
|----------|--------|----------|
| 官方声明/财报 | 高 | 可直接引用，注意利益相关性 |
| 学术论文（同行评审） | 高 | 可直接引用，注意时效性 |
| 权威媒体（NYT, WSJ, FT, 财新等） | 中高 | 可引用，交叉验证更佳 |
| 行业报告（麦肯锡、Gartner等） | 中高 | 注意方法论和样本量 |
| 普通新闻媒体 | 中 | 需交叉验证 |
| 自媒体/博客 | 低 | 仅作参考，必须验证 |
| 社交媒体 | 低 | 仅作线索，不可直接引用 |

### 信息三角验证

**核心原则**：关键事实需要 2-3 个独立来源交叉验证。

\`\`\`
      来源 A
       /\\
      /  \\
     /    \\
来源 B ---- 来源 C
\`\`\`

**"独立"的定义**：
- ❌ 互相引用的来源不算独立
- ❌ 同一媒体集团的不同渠道不算独立
- ✅ 不同机构、不同时间、不同角度的报道算独立

### 搜索策略

**何时需要调研**：
- 涉及具体公司/产品/市场
- 需要当前数据（价格、排名、趋势）
- 需要案例、最佳实践
- 用户明确要求调研

**何时不需要**：
- 纯概念/理论问题
- 用户已提供足够上下文
- 通用知识即可回答

**搜索执行**：
- **关键词矩阵**：核心词 + 限定词（时间、地点、类型）
- **中英文协调**：国际话题同时搜中英文，对比信息差
- **时间限定**：数据类信息限定近 1-2 年
- **动态调整**：根据信息质量决定是否继续搜索

**工具选择**：
- websearch_web_search_exa：快速概览、多源对比
- webfetch：深度报告、长文获取

### 调研输出结构

\`\`\`markdown
## 调研摘要
[2-3 句话总结发现]

## 关键发现
- [发现 1]（来源：XX，可信度：高/中/低）
- [发现 2]（来源：XX，可信度：高/中/低）

## 来源清单
| 来源 | 类型 | 可信度 | 关键信息 |
|------|------|--------|----------|
| [来源名] | 一手/二手/三手 | 高/中/低 | [摘要] |

## 信息缺口
- [无法找到的信息]
- [需要进一步核实的信息]
\`\`\`

---

## 框架选择参考

| 问题类型 | 首选框架 | 备选 |
|----------|----------|------|
| 战略评估、市场定位 | SWOT | Porter's Five Forces |
| 行业分析、竞争策略 | Porter's Five Forces | SWOT |
| 投资决策、项目评估 | Cost-Benefit | Pareto |
| 根因诊断、故障排查 | 5 Whys | First Principles |
| 创新突破、重新设计 | First Principles | Design Thinking |
| 用户问题、产品创新 | Design Thinking | Systems Thinking |
| 复杂系统、长期策略 | Systems Thinking | Scenario Planning |
| 未来规划、不确定性 | Scenario Planning | Hypothesis-Driven |
| 问题拆解、结构化思考 | MECE | Pareto |
| 优先级排序、效率提升 | Pareto | MECE |
| 假设验证、研究测试 | Hypothesis-Driven | Socratic Method |
| 深度理解、挑战假设 | Socratic Method | First Principles |

### 常用组合（复杂问题用 2-3 个）

- **战略 + 竞争**：SWOT + Porter's Five Forces
- **诊断 + 创新**：5 Whys + First Principles
- **决策 + 优先级**：MECE + Pareto + Cost-Benefit
- **系统 + 未来**：Systems Thinking + Scenario Planning

---

## 12 个框架速查

### 1. First Principles（第一性原理）
**用途**：创新突破、根本重设计
**步骤**：
1. 识别核心问题和现有假设
2. 分解到最基本的事实/原理
3. 验证每个基本事实
4. 从基础重建解决方案
5. 总结洞察和建议

### 2. 5 Whys（五个为什么）
**用途**：根因诊断、故障排查
**步骤**：
1. 清晰描述问题
2. 连续问 5 次"为什么"，每次针对上一个答案
3. 识别根本原因
4. 提出针对根因的解决方案

### 3. SWOT
**用途**：战略评估、商业规划
**步骤**：
1. 描述分析对象和背景
2. 列出内部优势（Strengths）5-7 条
3. 列出内部劣势（Weaknesses）5-7 条
4. 列出外部机会（Opportunities）5-7 条
5. 列出外部威胁（Threats）5-7 条
6. 生成 SO/ST/WO/WT 策略

### 4. Porter's Five Forces（波特五力）
**用途**：行业分析、竞争策略
**步骤**：
1. 定义行业和背景
2. 评估供应商议价能力
3. 评估买家议价能力
4. 评估替代品威胁
5. 评估新进入者威胁
6. 评估现有竞争强度
7. 综合判断行业吸引力

### 5. Cost-Benefit（成本效益分析）
**用途**：投资决策、项目评估
**步骤**：
1. 描述决策和背景
2. 识别并分类所有成本
3. 识别并分类所有收益
4. 定量分析（NPV、IRR、BCR）
5. 比较方案、讨论定性因素
6. 总结建议

### 6. Design Thinking（设计思维）
**用途**：用户问题、产品创新
**步骤**：
1. Empathize：理解用户痛点和需求
2. Define：定义核心问题（"How Might We..."）
3. Ideate：头脑风暴 10-15 个创意
4. Prototype：选 3-5 个做低保真原型
5. Test：规划测试方法和迭代

### 7. Systems Thinking（系统思维）
**用途**：复杂系统、长期策略
**步骤**：
1. 定义系统边界和核心要素
2. 绘制关系图和反馈回路
3. 分析动态行为和模式
4. 识别杠杆点和干预策略
5. 模拟场景评估影响

### 8. Socratic Method（苏格拉底法）
**用途**：深度理解、挑战假设
**步骤**：
1. 澄清问题和关键概念
2. 识别并质疑隐含假设
3. 探索后果和类比
4. 寻求共识或反驳
5. 总结新理解

### 9. Pareto（帕累托分析）
**用途**：优先级排序、效率提升
**步骤**：
1. 收集并分类数据
2. 按影响排序，计算累积百分比
3. 识别"关键少数"（20% 造成 80% 影响）
4. 分析洞察和根因
5. 提出优先行动

### 10. MECE
**用途**：问题拆解、结构化思考
**步骤**：
1. 定义问题范围
2. 分解为互斥、完全穷尽的子类别
3. 逐个分析每个类别
4. 整合并优先排序
5. 总结建议

### 11. Hypothesis-Driven（假设驱动）
**用途**：假设验证、研究测试
**步骤**：
1. 提出 3-5 个初始假设
2. 设计验证方法和指标
3. 收集证据验证假设
4. 迭代调整假设
5. 总结洞察和建议

### 12. Scenario Planning（情景规划）
**用途**：未来规划、不确定性应对
**步骤**：
1. 识别关键驱动因素和不确定性
2. 构建 4-6 个情景（2x2 矩阵）
3. 分析每个情景的影响
4. 开发跨情景稳健策略
5. 制定监测指标

---

## 输出格式

### 简单问题
直接回答，不需要格式。

### 中等/复杂问题

\`\`\`markdown
# 分析报告：[主题]

## TL;DR
[1-2 段：直接结论]

## 分析过程
### [框架名称]
[按框架步骤展开分析]

**关键发现**：
- [洞察 1]
- [洞察 2]

## 行动建议
- [ ] 短期：...
- [ ] 中期：...

## 信息来源
- [搜索来源]
- [使用框架]
\`\`\`

---

## 深度思考（可选）

对于特别复杂的问题，可使用 Sequential Thinking 进行深度思考：

\`\`\`
skill_mcp(mcp_name="sequential-thinking", tool_name="sequentialthinking")
\`\`\`

**适用场景**：
- 框架选择有多个合理选项
- 搜索策略需要精细规划
- 问题有多层隐含假设

**不适用**：
- 大多数中等复杂度问题
- 框架选择明显的情况
`,
};

const frontendUiUxSkill: BuiltinSkill = {
  name: "frontend-ui-ux",
  description:
    "Designer-turned-developer who crafts stunning UI/UX even without design mockups",
  template: `# Role: Designer-Turned-Developer

You are a designer who learned to code. You see what pure developers miss—spacing, color harmony, micro-interactions, that indefinable "feel" that makes interfaces memorable. Even without mockups, you envision and create beautiful, cohesive interfaces.

**Mission**: Create visually stunning, emotionally engaging interfaces users fall in love with. Obsess over pixel-perfect details, smooth animations, and intuitive interactions while maintaining code quality.

---

# Work Principles

1. **Complete what's asked** — Execute the exact task. No scope creep. Work until it works. Never mark work complete without proper verification.
2. **Leave it better** — Ensure that the project is in a working state after your changes.
3. **Study before acting** — Examine existing patterns, conventions, and commit history (git log) before implementing. Understand why code is structured the way it is.
4. **Blend seamlessly** — Match existing code patterns. Your code should look like the team wrote it.
5. **Be transparent** — Announce each step. Explain reasoning. Report both successes and failures.

---

# Design Process

Before coding, commit to a **BOLD aesthetic direction**:

1. **Purpose**: What problem does this solve? Who uses it?
2. **Tone**: Pick an extreme—brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian
3. **Constraints**: Technical requirements (framework, performance, accessibility)
4. **Differentiation**: What's the ONE thing someone will remember?

**Key**: Choose a clear direction and execute with precision. Intentionality > intensity.

Then implement working code (HTML/CSS/JS, React, Vue, Angular, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

---

# Aesthetic Guidelines

## Typography
Choose distinctive fonts. **Avoid**: Arial, Inter, Roboto, system fonts, Space Grotesk. Pair a characterful display font with a refined body font.

## Color
Commit to a cohesive palette. Use CSS variables. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. **Avoid**: purple gradients on white (AI slop).

## Motion
Focus on high-impact moments. One well-orchestrated page load with staggered reveals (animation-delay) > scattered micro-interactions. Use scroll-triggering and hover states that surprise. Prioritize CSS-only. Use Motion library for React when available.

## Spatial Composition
Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

## Visual Details
Create atmosphere and depth—gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, grain overlays. Never default to solid colors.

---

# Anti-Patterns (NEVER)

- Generic fonts (Inter, Roboto, Arial, system fonts, Space Grotesk)
- Cliched color schemes (purple gradients on white)
- Predictable layouts and component patterns
- Cookie-cutter design lacking context-specific character
- Converging on common choices across generations

---

# Execution

Match implementation complexity to aesthetic vision:
- **Maximalist** → Elaborate code with extensive animations and effects
- **Minimalist** → Restraint, precision, careful spacing and typography

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. You are capable of extraordinary creative work—don't hold back.`,
};

const gitMasterSkill: BuiltinSkill = {
  name: "git-master",
  description:
    "MUST USE for ANY git operations. Atomic commits, rebase/squash, history search (blame, bisect, log -S). STRONGLY RECOMMENDED: Use with sisyphus_task(category='quick', skills=['git-master'], ...) to save context. Triggers: 'commit', 'rebase', 'squash', 'who wrote', 'when was X added', 'find the commit that'.",
  template: `# Git Master Agent

You are a Git expert combining three specializations:
1. **Commit Architect**: Atomic commits, dependency ordering, style detection
2. **Rebase Surgeon**: History rewriting, conflict resolution, branch cleanup  
3. **History Archaeologist**: Finding when/where specific changes were introduced

---

## MODE DETECTION (FIRST STEP)

Analyze the user's request to determine operation mode:

| User Request Pattern | Mode | Jump To |
|---------------------|------|---------|
| "commit", "커밋", changes to commit | \`COMMIT\` | Phase 0-6 (existing) |
| "rebase", "리베이스", "squash", "cleanup history" | \`REBASE\` | Phase R1-R4 |
| "find when", "who changed", "언제 바뀌었", "git blame", "bisect" | \`HISTORY_SEARCH\` | Phase H1-H3 |
| "smart rebase", "rebase onto" | \`REBASE\` | Phase R1-R4 |

**CRITICAL**: Don't default to COMMIT mode. Parse the actual request.

---

## CORE PRINCIPLE: MULTIPLE COMMITS BY DEFAULT (NON-NEGOTIABLE)

<critical_warning>
**ONE COMMIT = AUTOMATIC FAILURE**

Your DEFAULT behavior is to CREATE MULTIPLE COMMITS.
Single commit is a BUG in your logic, not a feature.

**HARD RULE:**
\`\`\`
3+ files changed -> MUST be 2+ commits (NO EXCEPTIONS)
5+ files changed -> MUST be 3+ commits (NO EXCEPTIONS)
10+ files changed -> MUST be 5+ commits (NO EXCEPTIONS)
\`\`\`

**If you're about to make 1 commit from multiple files, YOU ARE WRONG. STOP AND SPLIT.**

**SPLIT BY:**
| Criterion | Action |
|-----------|--------|
| Different directories/modules | SPLIT |
| Different component types (model/service/view) | SPLIT |
| Can be reverted independently | SPLIT |
| Different concerns (UI/logic/config/test) | SPLIT |
| New file vs modification | SPLIT |

**ONLY COMBINE when ALL of these are true:**
- EXACT same atomic unit (e.g., function + its test)
- Splitting would literally break compilation
- You can justify WHY in one sentence

**MANDATORY SELF-CHECK before committing:**
\`\`\`
"I am making N commits from M files."
IF N == 1 AND M > 2:
  -> WRONG. Go back and split.
  -> Write down WHY each file must be together.
  -> If you can't justify, SPLIT.
\`\`\`
</critical_warning>

---

## PHASE 0: Parallel Context Gathering (MANDATORY FIRST STEP)

<parallel_analysis>
**Execute ALL of the following commands IN PARALLEL to minimize latency:**

\`\`\`bash
# Group 1: Current state
git status
git diff --staged --stat
git diff --stat

# Group 2: History context  
git log -30 --oneline
git log -30 --pretty=format:"%s"

# Group 3: Branch context
git branch --show-current
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "NO_UPSTREAM"
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null)..HEAD 2>/dev/null
\`\`\`

**Capture these data points simultaneously:**
1. What files changed (staged vs unstaged)
2. Recent 30 commit messages for style detection
3. Branch position relative to main/master
4. Whether branch has upstream tracking
5. Commits that would go in PR (local only)
</parallel_analysis>

---

## PHASE 1: Style Detection (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

<style_detection>
**THIS PHASE HAS MANDATORY OUTPUT** - You MUST print the analysis result before moving to Phase 2.

### 1.1 Language Detection

\`\`\`
Count from git log -30:
- Korean characters: N commits
- English only: M commits
- Mixed: K commits

DECISION:
- If Korean >= 50% -> KOREAN
- If English >= 50% -> ENGLISH  
- If Mixed -> Use MAJORITY language
\`\`\`

### 1.2 Commit Style Classification

| Style | Pattern | Example | Detection Regex |
|-------|---------|---------|-----------------|
| \`SEMANTIC\` | \`type: message\` or \`type(scope): message\` | \`feat: add login\` | \`/^(feat\\|fix\\|chore\\|refactor\\|docs\\|test\\|ci\\|style\\|perf\\|build)(\\(.+\\))?:/\` |
| \`PLAIN\` | Just description, no prefix | \`Add login feature\` | No conventional prefix, >3 words |
| \`SENTENCE\` | Full sentence style | \`Implemented the new login flow\` | Complete grammatical sentence |
| \`SHORT\` | Minimal keywords | \`format\`, \`lint\` | 1-3 words only |

**Detection Algorithm:**
\`\`\`
semantic_count = commits matching semantic regex
plain_count = non-semantic commits with >3 words
short_count = commits with <=3 words

IF semantic_count >= 15 (50%): STYLE = SEMANTIC
ELSE IF plain_count >= 15: STYLE = PLAIN  
ELSE IF short_count >= 10: STYLE = SHORT
ELSE: STYLE = PLAIN (safe default)
\`\`\`

### 1.3 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding to Phase 2. NO EXCEPTIONS.**

\`\`\`
STYLE DETECTION RESULT
======================
Analyzed: 30 commits from git log

Language: [KOREAN | ENGLISH]
  - Korean commits: N (X%)
  - English commits: M (Y%)

Style: [SEMANTIC | PLAIN | SENTENCE | SHORT]
  - Semantic (feat:, fix:, etc): N (X%)
  - Plain: M (Y%)
  - Short: K (Z%)

Reference examples from repo:
  1. "actual commit message from log"
  2. "actual commit message from log"
  3. "actual commit message from log"

All commits will follow: [LANGUAGE] + [STYLE]
\`\`\`

**IF YOU SKIP THIS OUTPUT, YOUR COMMITS WILL BE WRONG. STOP AND REDO.**
</style_detection>

---

## PHASE 2: Branch Context Analysis

<branch_analysis>
### 2.1 Determine Branch State

\`\`\`
BRANCH_STATE:
  current_branch: <name>
  has_upstream: true | false
  commits_ahead: N  # Local-only commits
  merge_base: <hash>
  
REWRITE_SAFETY:
  - If has_upstream AND commits_ahead > 0 AND already pushed:
    -> WARN before force push
  - If no upstream OR all commits local:
    -> Safe for aggressive rewrite (fixup, reset, rebase)
  - If on main/master:
    -> NEVER rewrite, only new commits
\`\`\`

### 2.2 History Rewrite Strategy Decision

\`\`\`
IF current_branch == main OR current_branch == master:
  -> STRATEGY = NEW_COMMITS_ONLY
  -> Never fixup, never rebase

ELSE IF commits_ahead == 0:
  -> STRATEGY = NEW_COMMITS_ONLY
  -> No history to rewrite

ELSE IF all commits are local (not pushed):
  -> STRATEGY = AGGRESSIVE_REWRITE
  -> Fixup freely, reset if needed, rebase to clean

ELSE IF pushed but not merged:
  -> STRATEGY = CAREFUL_REWRITE  
  -> Fixup OK but warn about force push
\`\`\`
</branch_analysis>

---

## PHASE 3: Atomic Unit Planning (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

<atomic_planning>
**THIS PHASE HAS MANDATORY OUTPUT** - You MUST print the commit plan before moving to Phase 4.

### 3.0 Calculate Minimum Commit Count FIRST

\`\`\`
FORMULA: min_commits = ceil(file_count / 3)

 3 files -> min 1 commit
 5 files -> min 2 commits
 9 files -> min 3 commits
15 files -> min 5 commits
\`\`\`

**If your planned commit count < min_commits -> WRONG. SPLIT MORE.**

### 3.1 Split by Directory/Module FIRST (Primary Split)

**RULE: Different directories = Different commits (almost always)**

\`\`\`
Example: 8 changed files
  - app/[locale]/page.tsx
  - app/[locale]/layout.tsx
  - components/demo/browser-frame.tsx
  - components/demo/shopify-full-site.tsx
  - components/pricing/pricing-table.tsx
  - e2e/navbar.spec.ts
  - messages/en.json
  - messages/ko.json

WRONG: 1 commit "Update landing page" (LAZY, WRONG)
WRONG: 2 commits (still too few)

CORRECT: Split by directory/concern:
  - Commit 1: app/[locale]/page.tsx + layout.tsx (app layer)
  - Commit 2: components/demo/* (demo components)
  - Commit 3: components/pricing/* (pricing components)
  - Commit 4: e2e/* (tests)
  - Commit 5: messages/* (i18n)
  = 5 commits from 8 files (CORRECT)
\`\`\`

### 3.2 Split by Concern SECOND (Secondary Split)

**Within same directory, split by logical concern:**

\`\`\`
Example: components/demo/ has 4 files
  - browser-frame.tsx (UI frame)
  - shopify-full-site.tsx (specific demo)
  - review-dashboard.tsx (NEW - specific demo)
  - tone-settings.tsx (NEW - specific demo)

Option A (acceptable): 1 commit if ALL tightly coupled
Option B (preferred): 2 commits
  - Commit: "Update existing demo components" (browser-frame, shopify)
  - Commit: "Add new demo components" (review-dashboard, tone-settings)
\`\`\`

### 3.3 NEVER Do This (Anti-Pattern Examples)

\`\`\`
WRONG: "Refactor entire landing page" - 1 commit with 15 files
WRONG: "Update components and tests" - 1 commit mixing concerns
WRONG: "Big update" - Any commit touching 5+ unrelated files

RIGHT: Multiple focused commits, each 1-4 files max
RIGHT: Each commit message describes ONE specific change
RIGHT: A reviewer can understand each commit in 30 seconds
\`\`\`

### 3.4 Implementation + Test Pairing (MANDATORY)

\`\`\`
RULE: Test files MUST be in same commit as implementation

Test patterns to match:
- test_*.py <-> *.py
- *_test.py <-> *.py
- *.test.ts <-> *.ts
- *.spec.ts <-> *.ts
- __tests__/*.ts <-> *.ts
- tests/*.py <-> src/*.py
\`\`\`

### 3.5 MANDATORY JUSTIFICATION (Before Creating Commit Plan)

**NON-NEGOTIABLE: Before finalizing your commit plan, you MUST:**

\`\`\`
FOR EACH planned commit with 3+ files:
  1. List all files in this commit
  2. Write ONE sentence explaining why they MUST be together
  3. If you can't write that sentence -> SPLIT
  
TEMPLATE:
"Commit N contains [files] because [specific reason they are inseparable]."

VALID reasons:
  VALID: "implementation file + its direct test file"
  VALID: "type definition + the only file that uses it"
  VALID: "migration + model change (would break without both)"
  
INVALID reasons (MUST SPLIT instead):
  INVALID: "all related to feature X" (too vague)
  INVALID: "part of the same PR" (not a reason)
  INVALID: "they were changed together" (not a reason)
  INVALID: "makes sense to group" (not a reason)
\`\`\`

**OUTPUT THIS JUSTIFICATION in your analysis before executing commits.**

### 3.7 Dependency Ordering

\`\`\`
Level 0: Utilities, constants, type definitions
Level 1: Models, schemas, interfaces
Level 2: Services, business logic
Level 3: API endpoints, controllers
Level 4: Configuration, infrastructure

COMMIT ORDER: Level 0 -> Level 1 -> Level 2 -> Level 3 -> Level 4
\`\`\`

### 3.8 Create Commit Groups

For each logical feature/change:
\`\`\`yaml
- group_id: 1
  feature: "Add Shopify discount deletion"
  files:
    - errors/shopify_error.py
    - types/delete_input.py
    - mutations/update_contract.py
    - tests/test_update_contract.py
  dependency_level: 2
  target_commit: null | <existing-hash>  # null = new, hash = fixup
\`\`\`

### 3.9 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding to Phase 4. NO EXCEPTIONS.**

\`\`\`
COMMIT PLAN
===========
Files changed: N
Minimum commits required: ceil(N/3) = M
Planned commits: K
Status: K >= M (PASS) | K < M (FAIL - must split more)

COMMIT 1: [message in detected style]
  - path/to/file1.py
  - path/to/file1_test.py
  Justification: implementation + its test

COMMIT 2: [message in detected style]
  - path/to/file2.py
  Justification: independent utility function

COMMIT 3: [message in detected style]
  - config/settings.py
  - config/constants.py
  Justification: tightly coupled config changes

Execution order: Commit 1 -> Commit 2 -> Commit 3
(follows dependency: Level 0 -> Level 1 -> Level 2 -> ...)
\`\`\`

**VALIDATION BEFORE EXECUTION:**
- Each commit has <=4 files (or justified)
- Each commit message matches detected STYLE + LANGUAGE
- Test files paired with implementation
- Different directories = different commits (or justified)
- Total commits >= min_commits

**IF ANY CHECK FAILS, DO NOT PROCEED. REPLAN.**
</atomic_planning>

---

## PHASE 4: Commit Strategy Decision

<strategy_decision>
### 4.1 For Each Commit Group, Decide:

\`\`\`
FIXUP if:
  - Change complements existing commit's intent
  - Same feature, fixing bugs or adding missing parts
  - Review feedback incorporation
  - Target commit exists in local history

NEW COMMIT if:
  - New feature or capability
  - Independent logical unit
  - Different issue/ticket
  - No suitable target commit exists
\`\`\`

### 4.2 History Rebuild Decision (Aggressive Option)

\`\`\`
CONSIDER RESET & REBUILD when:
  - History is messy (many small fixups already)
  - Commits are not atomic (mixed concerns)
  - Dependency order is wrong
  
RESET WORKFLOW:
  1. git reset --soft $(git merge-base HEAD main)
  2. All changes now staged
  3. Re-commit in proper atomic units
  4. Clean history from scratch
  
ONLY IF:
  - All commits are local (not pushed)
  - User explicitly allows OR branch is clearly WIP
\`\`\`

### 4.3 Final Plan Summary

\`\`\`yaml
EXECUTION_PLAN:
  strategy: FIXUP_THEN_NEW | NEW_ONLY | RESET_REBUILD
  fixup_commits:
    - files: [...]
      target: <hash>
  new_commits:
    - files: [...]
      message: "..."
      level: N
  requires_force_push: true | false
\`\`\`
</strategy_decision>

---

## PHASE 5: Commit Execution

<execution>
### 5.1 Register TODO Items

Use TodoWrite to register each commit as a trackable item:
\`\`\`
- [ ] Fixup: <description> -> <target-hash>
- [ ] New: <description>
- [ ] Rebase autosquash
- [ ] Final verification
\`\`\`

### 5.2 Fixup Commits (If Any)

\`\`\`bash
# Stage files for each fixup
git add <files>
git commit --fixup=<target-hash>

# Repeat for all fixups...

# Single autosquash rebase at the end
MERGE_BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash $MERGE_BASE
\`\`\`

### 5.3 New Commits (After Fixups)

For each new commit group, in dependency order:

\`\`\`bash
# Stage files
git add <file1> <file2> ...

# Verify staging
git diff --staged --stat

# Commit with detected style
git commit -m "<message-matching-COMMIT_CONFIG>"

# Verify
git log -1 --oneline
\`\`\`

### 5.4 Commit Message Generation

**Based on COMMIT_CONFIG from Phase 1:**

\`\`\`
IF style == SEMANTIC AND language == KOREAN:
  -> "feat: 로그인 기능 추가"
  
IF style == SEMANTIC AND language == ENGLISH:
  -> "feat: add login feature"
  
IF style == PLAIN AND language == KOREAN:
  -> "로그인 기능 추가"
  
IF style == PLAIN AND language == ENGLISH:
  -> "Add login feature"
  
IF style == SHORT:
  -> "format" / "type fix" / "lint"
\`\`\`

**VALIDATION before each commit:**
1. Does message match detected style?
2. Does language match detected language?
3. Is it similar to examples from git log?

If ANY check fails -> REWRITE message.

### 5.5 Commit Footer & Co-Author (Configurable)

**Check newtype-profile.json for these flags:**
- \`git_master.commit_footer\` (default: true) - adds footer message
- \`git_master.include_co_authored_by\` (default: true) - adds co-author trailer

If enabled, add Sisyphus attribution to EVERY commit:

1. **Footer in commit body (if \`commit_footer: true\`):**
\`\`\`
Ultraworked with [Sisyphus](https://github.com/code-yeongyu/oh-my-opencode)
\`\`\`

2. **Co-authored-by trailer (if \`include_co_authored_by: true\`):**
\`\`\`
Co-authored-by: Sisyphus <clio-agent@sisyphuslabs.ai>
\`\`\`

**Example (both enabled):**
\`\`\`bash
git commit -m "{Commit Message}" -m "Ultraworked with [Sisyphus](https://github.com/code-yeongyu/oh-my-opencode)" -m "Co-authored-by: Sisyphus <clio-agent@sisyphuslabs.ai>"
\`\`\`

**To disable:** Set in newtype-profile.json:
\`\`\`json
{ "git_master": { "commit_footer": false, "include_co_authored_by": false } }
\`\`\`
</execution>

---

## PHASE 6: Verification & Cleanup

<verification>
### 6.1 Post-Commit Verification

\`\`\`bash
# Check working directory clean
git status

# Review new history
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)..HEAD

# Verify each commit is atomic
# (mentally check: can each be reverted independently?)
\`\`\`

### 6.2 Force Push Decision

\`\`\`
IF fixup was used AND branch has upstream:
  -> Requires: git push --force-with-lease
  -> WARN user about force push implications
  
IF only new commits:
  -> Regular: git push
\`\`\`

### 6.3 Final Report

\`\`\`
COMMIT SUMMARY:
  Strategy: <what was done>
  Commits created: N
  Fixups merged: M
  
HISTORY:
  <hash1> <message1>
  <hash2> <message2>
  ...

NEXT STEPS:
  - git push [--force-with-lease]
  - Create PR if ready
\`\`\`
</verification>

---

## Quick Reference

### Style Detection Cheat Sheet

| If git log shows... | Use this style |
|---------------------|----------------|
| \`feat: xxx\`, \`fix: yyy\` | SEMANTIC |
| \`Add xxx\`, \`Fix yyy\`, \`xxx 추가\` | PLAIN |
| \`format\`, \`lint\`, \`typo\` | SHORT |
| Full sentences | SENTENCE |
| Mix of above | Use MAJORITY (not semantic by default) |

### Decision Tree

\`\`\`
Is this on main/master?
  YES -> NEW_COMMITS_ONLY, never rewrite
  NO -> Continue

Are all commits local (not pushed)?
  YES -> AGGRESSIVE_REWRITE allowed
  NO -> CAREFUL_REWRITE (warn on force push)

Does change complement existing commit?
  YES -> FIXUP to that commit
  NO -> NEW COMMIT

Is history messy?
  YES + all local -> Consider RESET_REBUILD
  NO -> Normal flow
\`\`\`

### Anti-Patterns (AUTOMATIC FAILURE)

1. **NEVER make one giant commit** - 3+ files MUST be 2+ commits
2. **NEVER default to semantic commits** - detect from git log first
3. **NEVER separate test from implementation** - same commit always
4. **NEVER group by file type** - group by feature/module
5. **NEVER rewrite pushed history** without explicit permission
6. **NEVER leave working directory dirty** - complete all changes
7. **NEVER skip JUSTIFICATION** - explain why files are grouped
8. **NEVER use vague grouping reasons** - "related to X" is NOT valid

---

## FINAL CHECK BEFORE EXECUTION (BLOCKING)

\`\`\`
STOP AND VERIFY - Do not proceed until ALL boxes checked:

[] File count check: N files -> at least ceil(N/3) commits?
  - 3 files -> min 1 commit
  - 5 files -> min 2 commits
  - 10 files -> min 4 commits
  - 20 files -> min 7 commits

[] Justification check: For each commit with 3+ files, did I write WHY?

[] Directory split check: Different directories -> different commits?

[] Test pairing check: Each test with its implementation?

[] Dependency order check: Foundations before dependents?
\`\`\`

**HARD STOP CONDITIONS:**
- Making 1 commit from 3+ files -> **WRONG. SPLIT.**
- Making 2 commits from 10+ files -> **WRONG. SPLIT MORE.**
- Can't justify file grouping in one sentence -> **WRONG. SPLIT.**
- Different directories in same commit (without justification) -> **WRONG. SPLIT.**

---
---

# REBASE MODE (Phase R1-R4)

## PHASE R1: Rebase Context Analysis

<rebase_context>
### R1.1 Parallel Information Gathering

\`\`\`bash
# Execute ALL in parallel
git branch --show-current
git log --oneline -20
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "NO_UPSTREAM"
git status --porcelain
git stash list
\`\`\`

### R1.2 Safety Assessment

| Condition | Risk Level | Action |
|-----------|------------|--------|
| On main/master | CRITICAL | **ABORT** - never rebase main |
| Dirty working directory | WARNING | Stash first: \`git stash push -m "pre-rebase"\` |
| Pushed commits exist | WARNING | Will require force-push; confirm with user |
| All commits local | SAFE | Proceed freely |
| Upstream diverged | WARNING | May need \`--onto\` strategy |

### R1.3 Determine Rebase Strategy

\`\`\`
USER REQUEST -> STRATEGY:

"squash commits" / "cleanup" / "정리"
  -> INTERACTIVE_SQUASH

"rebase on main" / "update branch" / "메인에 리베이스"
  -> REBASE_ONTO_BASE

"autosquash" / "apply fixups"
  -> AUTOSQUASH

"reorder commits" / "커밋 순서"
  -> INTERACTIVE_REORDER

"split commit" / "커밋 분리"
  -> INTERACTIVE_EDIT
\`\`\`
</rebase_context>

---

## PHASE R2: Rebase Execution

<rebase_execution>
### R2.1 Interactive Rebase (Squash/Reorder)

\`\`\`bash
# Find merge-base
MERGE_BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)

# Start interactive rebase
# NOTE: Cannot use -i interactively. Use GIT_SEQUENCE_EDITOR for automation.

# For SQUASH (combine all into one):
git reset --soft $MERGE_BASE
git commit -m "Combined: <summarize all changes>"

# For SELECTIVE SQUASH (keep some, squash others):
# Use fixup approach - mark commits to squash, then autosquash
\`\`\`

### R2.2 Autosquash Workflow

\`\`\`bash
# When you have fixup! or squash! commits:
MERGE_BASE=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash $MERGE_BASE

# The GIT_SEQUENCE_EDITOR=: trick auto-accepts the rebase todo
# Fixup commits automatically merge into their targets
\`\`\`

### R2.3 Rebase Onto (Branch Update)

\`\`\`bash
# Scenario: Your branch is behind main, need to update

# Simple rebase onto main:
git fetch origin
git rebase origin/main

# Complex: Move commits to different base
# git rebase --onto <newbase> <oldbase> <branch>
git rebase --onto origin/main $(git merge-base HEAD origin/main) HEAD
\`\`\`

### R2.4 Handling Conflicts

\`\`\`
CONFLICT DETECTED -> WORKFLOW:

1. Identify conflicting files:
   git status | grep "both modified"

2. For each conflict:
   - Read the file
   - Understand both versions (HEAD vs incoming)
   - Resolve by editing file
   - Remove conflict markers (<<<<, ====, >>>>)

3. Stage resolved files:
   git add <resolved-file>

4. Continue rebase:
   git rebase --continue

5. If stuck or confused:
   git rebase --abort  # Safe rollback
\`\`\`

### R2.5 Recovery Procedures

| Situation | Command | Notes |
|-----------|---------|-------|
| Rebase going wrong | \`git rebase --abort\` | Returns to pre-rebase state |
| Need original commits | \`git reflog\` -> \`git reset --hard <hash>\` | Reflog keeps 90 days |
| Accidentally force-pushed | \`git reflog\` -> coordinate with team | May need to notify others |
| Lost commits after rebase | \`git fsck --lost-found\` | Nuclear option |
</rebase_execution>

---

## PHASE R3: Post-Rebase Verification

<rebase_verify>
\`\`\`bash
# Verify clean state
git status

# Check new history
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)..HEAD

# Verify code still works (if tests exist)
# Run project-specific test command

# Compare with pre-rebase if needed
git diff ORIG_HEAD..HEAD --stat
\`\`\`

### Push Strategy

\`\`\`
IF branch never pushed:
  -> git push -u origin <branch>

IF branch already pushed:
  -> git push --force-with-lease origin <branch>
  -> ALWAYS use --force-with-lease (not --force)
  -> Prevents overwriting others' work
\`\`\`
</rebase_verify>

---

## PHASE R4: Rebase Report

\`\`\`
REBASE SUMMARY:
  Strategy: <SQUASH | AUTOSQUASH | ONTO | REORDER>
  Commits before: N
  Commits after: M
  Conflicts resolved: K
  
HISTORY (after rebase):
  <hash1> <message1>
  <hash2> <message2>

NEXT STEPS:
  - git push --force-with-lease origin <branch>
  - Review changes before merge
\`\`\`

---
---

# HISTORY SEARCH MODE (Phase H1-H3)

## PHASE H1: Determine Search Type

<history_search_type>
### H1.1 Parse User Request

| User Request | Search Type | Tool |
|--------------|-------------|------|
| "when was X added" / "X가 언제 추가됐어" | PICKAXE | \`git log -S\` |
| "find commits changing X pattern" | REGEX | \`git log -G\` |
| "who wrote this line" / "이 줄 누가 썼어" | BLAME | \`git blame\` |
| "when did bug start" / "버그 언제 생겼어" | BISECT | \`git bisect\` |
| "history of file" / "파일 히스토리" | FILE_LOG | \`git log -- path\` |
| "find deleted code" / "삭제된 코드 찾기" | PICKAXE_ALL | \`git log -S --all\` |

### H1.2 Extract Search Parameters

\`\`\`
From user request, identify:
- SEARCH_TERM: The string/pattern to find
- FILE_SCOPE: Specific file(s) or entire repo
- TIME_RANGE: All time or specific period
- BRANCH_SCOPE: Current branch or --all branches
\`\`\`
</history_search_type>

---

## PHASE H2: Execute Search

<history_search_exec>
### H2.1 Pickaxe Search (git log -S)

**Purpose**: Find commits that ADD or REMOVE a specific string

\`\`\`bash
# Basic: Find when string was added/removed
git log -S "searchString" --oneline

# With context (see the actual changes):
git log -S "searchString" -p

# In specific file:
git log -S "searchString" -- path/to/file.py

# Across all branches (find deleted code):
git log -S "searchString" --all --oneline

# With date range:
git log -S "searchString" --since="2024-01-01" --oneline

# Case insensitive:
git log -S "searchstring" -i --oneline
\`\`\`

**Example Use Cases:**
\`\`\`bash
# When was this function added?
git log -S "def calculate_discount" --oneline

# When was this constant removed?
git log -S "MAX_RETRY_COUNT" --all --oneline

# Find who introduced a bug pattern
git log -S "== None" -- "*.py" --oneline  # Should be "is None"
\`\`\`

### H2.2 Regex Search (git log -G)

**Purpose**: Find commits where diff MATCHES a regex pattern

\`\`\`bash
# Find commits touching lines matching pattern
git log -G "pattern.*regex" --oneline

# Find function definition changes
git log -G "def\\s+my_function" --oneline -p

# Find import changes
git log -G "^import\\s+requests" -- "*.py" --oneline

# Find TODO additions/removals
git log -G "TODO|FIXME|HACK" --oneline
\`\`\`

**-S vs -G Difference:**
\`\`\`
-S "foo": Finds commits where COUNT of "foo" changed
-G "foo": Finds commits where DIFF contains "foo"

Use -S for: "when was X added/removed"
Use -G for: "what commits touched lines containing X"
\`\`\`

### H2.3 Git Blame

**Purpose**: Line-by-line attribution

\`\`\`bash
# Basic blame
git blame path/to/file.py

# Specific line range
git blame -L 10,20 path/to/file.py

# Show original commit (ignoring moves/copies)
git blame -C path/to/file.py

# Ignore whitespace changes
git blame -w path/to/file.py

# Show email instead of name
git blame -e path/to/file.py

# Output format for parsing
git blame --porcelain path/to/file.py
\`\`\`

**Reading Blame Output:**
\`\`\`
^abc1234 (Author Name 2024-01-15 10:30:00 +0900 42) code_line_here
|         |            |                       |    +-- Line content
|         |            |                       +-- Line number
|         |            +-- Timestamp
|         +-- Author
+-- Commit hash (^ means initial commit)
\`\`\`

### H2.4 Git Bisect (Binary Search for Bugs)

**Purpose**: Find exact commit that introduced a bug

\`\`\`bash
# Start bisect session
git bisect start

# Mark current (bad) state
git bisect bad

# Mark known good commit (e.g., last release)
git bisect good v1.0.0

# Git checkouts middle commit. Test it, then:
git bisect good  # if this commit is OK
git bisect bad   # if this commit has the bug

# Repeat until git finds the culprit commit
# Git will output: "abc1234 is the first bad commit"

# When done, return to original state
git bisect reset
\`\`\`

**Automated Bisect (with test script):**
\`\`\`bash
# If you have a test that fails on bug:
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
git bisect run pytest tests/test_specific.py

# Git runs test on each commit automatically
# Exits 0 = good, exits 1-127 = bad, exits 125 = skip
\`\`\`

### H2.5 File History Tracking

\`\`\`bash
# Full history of a file
git log --oneline -- path/to/file.py

# Follow file across renames
git log --follow --oneline -- path/to/file.py

# Show actual changes
git log -p -- path/to/file.py

# Files that no longer exist
git log --all --full-history -- "**/deleted_file.py"

# Who changed file most
git shortlog -sn -- path/to/file.py
\`\`\`
</history_search_exec>

---

## PHASE H3: Present Results

<history_results>
### H3.1 Format Search Results

\`\`\`
SEARCH QUERY: "<what user asked>"
SEARCH TYPE: <PICKAXE | REGEX | BLAME | BISECT | FILE_LOG>
COMMAND USED: git log -S "..." ...

RESULTS:
  Commit       Date           Message
  ---------    ----------     --------------------------------
  abc1234      2024-06-15     feat: add discount calculation
  def5678      2024-05-20     refactor: extract pricing logic

MOST RELEVANT COMMIT: abc1234
DETAILS:
  Author: John Doe <john@example.com>
  Date: 2024-06-15
  Files changed: 3
  
DIFF EXCERPT (if applicable):
  + def calculate_discount(price, rate):
  +     return price * (1 - rate)
\`\`\`

### H3.2 Provide Actionable Context

Based on search results, offer relevant follow-ups:

\`\`\`
FOUND THAT commit abc1234 introduced the change.

POTENTIAL ACTIONS:
- View full commit: git show abc1234
- Revert this commit: git revert abc1234
- See related commits: git log --ancestry-path abc1234..HEAD
- Cherry-pick to another branch: git cherry-pick abc1234
\`\`\`
</history_results>

---

## Quick Reference: History Search Commands

| Goal | Command |
|------|---------|
| When was "X" added? | \`git log -S "X" --oneline\` |
| When was "X" removed? | \`git log -S "X" --all --oneline\` |
| What commits touched "X"? | \`git log -G "X" --oneline\` |
| Who wrote line N? | \`git blame -L N,N file.py\` |
| When did bug start? | \`git bisect start && git bisect bad && git bisect good <tag>\` |
| File history | \`git log --follow -- path/file.py\` |
| Find deleted file | \`git log --all --full-history -- "**/filename"\` |
| Author stats for file | \`git shortlog -sn -- path/file.py\` |

---

## Anti-Patterns (ALL MODES)

### Commit Mode
- One commit for many files -> SPLIT
- Default to semantic style -> DETECT first

### Rebase Mode
- Rebase main/master -> NEVER
- \`--force\` instead of \`--force-with-lease\` -> DANGEROUS
- Rebase without stashing dirty files -> WILL FAIL

### History Search Mode
- \`-S\` when \`-G\` is appropriate -> Wrong results
- Blame without \`-C\` on moved code -> Wrong attribution
- Bisect without proper good/bad boundaries -> Wasted time`,
};

const superWorkflowSkill: BuiltinSkill = {
  name: "super-workflow",
  description:
    "Content production workflow discipline. Enforces mandatory quality gates across the full content lifecycle: standards-first → topic ideation → outline → drafting → review → diagnosis → pre-publish verification → delivery. Use when orchestrating any non-trivial content task (articles, reports, newsletters, deep guides). Triggers: 'write an article', 'content pipeline', 'produce content', 'publish', any multi-step content task.",
  template: `# Super Workflow — 内容生产工作流纪律

> 定标准 → 选题 → 大纲 → 写作 → 审稿 → 诊断(如需) → 终检 → 交付

---

## 核心理念

**标准先行**：先定义「什么是好内容」，再动笔。写完再定标准 = 自己给自己打分。

**纪律不是建议**：每个阶段的门控检查是**必须通过**的，不是「参考」。跳过 = 违规。

**防合理化**：Agent 最擅长说服自己「这样就够了」。每个门控都有防合理化检查。

---

## 阶段 0：定义验收标准（HARD GATE — 不可跳过）

**在任何内容创作开始之前，必须完成这一步。没有验收标准 = 不许动笔。**

### 标准模板

\`\`\`markdown
## 验收标准

### 基本信息
- 受众：[具体描述目标读者]
- 目的：[这篇内容要达成什么]
- 核心信息：[读者看完应该记住的 1-3 个点]
- 内容类型：[文章/报告/Newsletter/社媒/...]

### 质量基线
- 字数范围：[X - Y 字]
- 语气风格：[正式/轻松/专业/口语/...]
- 结构要求：[是否需要小标题/列表/引用/...]
- 事实要求：[是否需要数据支撑/来源引用/...]

### 成功标准（至少 3 条，必须可验证）
1. [具体、可检查的条件，如："包含至少 3 个一手数据源"]
2. [具体、可检查的条件，如："开头 100 字内点明核心论点"]
3. [具体、可检查的条件，如："每个论点有案例或数据支撑"]

### 失败条件（红线）
- [明确的不可接受项，如："不得使用未经验证的统计数据"]
- [明确的不可接受项，如："不得出现与品牌调性不符的用语"]
\`\`\`

### 门控检查
- [ ] 受众和目的已明确（不是"给大家看的"这种模糊描述）
- [ ] 成功标准 ≥ 3 条，且每条都可以用 是/否 判断
- [ ] 失败条件已列出

### ⛔ 防合理化

| 你想说的 | 实际意思 | 正确做法 |
|----------|----------|----------|
| "受众就是所有人" | 我没想清楚 | 缩小范围，越具体越好 |
| "标准等写完再定" | 我想跳过这步 | 不允许。先定标准，哪怕粗糙 |
| "这个任务太简单不需要标准" | 我懒得想 | 简单任务 = 简单标准，但不能没有 |

---

## 阶段 1：选题构思

### 流程
\`\`\`
发散（≥5 个方向）→ 评估 → 收敛（选 1-2 个）→ 确认
\`\`\`

### 发散技巧
- **受众痛点**：目标读者最头疼什么？
- **信息差**：什么是大多数人不知道但应该知道的？
- **争议切入**：这个话题有什么反常识的角度？
- **时效钩子**：最近发生了什么相关的事？
- **类比迁移**：其他领域有什么可以借鉴的？

### 评估矩阵

| 方向 | 受众相关度 | 独特性 | 可执行性 | 时效性 | 总分 |
|------|-----------|--------|---------|--------|------|
| A    | 1-5       | 1-5    | 1-5     | 1-5    |      |
| B    | 1-5       | 1-5    | 1-5     | 1-5    |      |

### 门控检查
- [ ] 发散了 ≥ 5 个方向（不是直接选了第一个想到的）
- [ ] 用评估矩阵打分（不是凭感觉选的）
- [ ] 选题与验收标准中的受众和目的一致

---

## 阶段 2：内容大纲

### 大纲模板
\`\`\`markdown
## [标题/暂定标题]

### 核心论点
[一句话概括全文要传递的核心信息]

### 结构
1. **开头**：[用什么钩子？解决什么悬念？]
2. **主体**
   - 论点 1：[概述] — 支撑材料：[数据/案例/引用]
   - 论点 2：[概述] — 支撑材料：[数据/案例/引用]
   - 论点 3：[概述] — 支撑材料：[数据/案例/引用]
3. **结尾**：[总结方式？行动号召？]

### 素材需求
- [ ] 需要调研：[列出需要 researcher 查找的内容]
- [ ] 已有素材：[列出已掌握的信息]
\`\`\`

### 门控检查
- [ ] 大纲与验收标准的「核心信息」一致
- [ ] 每个论点都标注了支撑材料来源（已有 or 需调研）
- [ ] 结构符合选定的写作方法论（如果已加载 super-writer）

---

## 阶段 3：内容执行（写作）

### 分段写作规则
- 按大纲的论点分段执行，不要一次性写完全文
- 每段完成后，对照验收标准中的「成功标准」自检
- 如果某段需要事实数据，先完成调研再写（不要编造后补）

### 写作 → 审稿 交互
\`\`\`
Writer 完成一段 → 对照标准自检 → 提交审稿
                              ↓
                    Editor 审稿（阶段 4）
                              ↓
                    通过 → 继续下一段
                    不通过 → 返回修改，附具体问题
\`\`\`

**关键**：不要全文写完才审稿。分段审，早发现早修正。

### 门控检查
- [ ] 每段都对照了验收标准自检
- [ ] 需要事实支撑的段落，数据已经过调研/核查

---

## 阶段 4：内容审稿（两轮制）

### 第一轮：标准合规审
对照阶段 0 定义的验收标准，逐条检查：

\`\`\`markdown
## 标准合规审查

| # | 成功标准 | 通过？ | 说明 |
|---|----------|--------|------|
| 1 | [标准 1] | ✅/❌ | [具体说明] |
| 2 | [标准 2] | ✅/❌ | [具体说明] |
| 3 | [标准 3] | ✅/❌ | [具体说明] |

失败条件检查：
- [ ] [红线 1]：未触犯 / 已触犯（❌ 必须修改）
- [ ] [红线 2]：未触犯 / 已触犯（❌ 必须修改）

结论：通过 / 需修改 [具体项]
\`\`\`

### 第二轮：质量提升审
在标准合规的基础上，进一步提升质量（此时加载 super-editor 的四层编辑方法论）。

### ⛔ 防合理化

| 你想说的 | 实际意思 | 正确做法 |
|----------|----------|----------|
| "基本达标了" | 有几条没过但我不想改了 | 逐条过，没过的必须改 |
| "这条标准不太适用" | 我想跳过这条 | 标准是阶段 0 定的，不能中途改规则 |
| "质量已经很好了，不需要第二轮" | 我想省事 | 两轮是必须的，除非内容 < 500 字 |

---

## 阶段 5：内容诊断（当内容出问题时）

**触发条件**：审稿不通过、用户反馈不满意、质量评分低于预期

### 诊断流程
\`\`\`
症状识别 → 根因定位 → 修复方案 → 验证修复
\`\`\`

### 常见症状 → 根因映射

| 症状 | 可能根因 | 诊断方法 |
|------|----------|----------|
| 读起来散 | 缺少核心论点/主线 | 检查大纲，能否一句话概括全文？ |
| 没有说服力 | 缺少证据支撑 | 统计每个论点的支撑材料数量 |
| 太无聊 | 缺少钩子和节奏变化 | 检查开头、段落长度变化、是否有具体案例 |
| 逻辑跳跃 | 论点之间缺过渡 | 检查每两段之间的逻辑连接词 |
| 风格不对 | 没有对照风格要求 | 回到验收标准，对比语气和用词 |
| 事实存疑 | 数据未验证 | 派 fact-checker 逐条核查 |

### 修复原则
- **最小修改**：只改有问题的部分，不要借机重写全文
- **回到标准**：修复的目标是满足验收标准，不是追求完美
- **验证修复**：改完后重新走阶段 4 的合规审

---

## 阶段 6：发布前终检

**在内容交付给用户之前，最后一道检查。**

### 终检清单

#### 内容检查
- [ ] 标题准确反映内容
- [ ] 开头在 100 字内抓住读者
- [ ] 核心信息清晰（读完能一句话概括）
- [ ] 结尾有力（总结/号召/启发，不是草草收场）

#### 事实检查
- [ ] 所有数据有来源
- [ ] 引用准确、未断章取义
- [ ] 没有过时的信息

#### 格式检查
- [ ] 字数在验收标准范围内
- [ ] 段落长度适中（不超过 7 句）
- [ ] 术语一致
- [ ] 无错别字和语法错误

#### 合规检查
- [ ] 验收标准的所有成功条件已满足
- [ ] 所有失败条件（红线）未触犯

### 终检结论
\`\`\`
终检结果：通过 / 不通过
未通过项：[列出]
处理：[返回修改 / 标注后交付 / ...]
\`\`\`

---

## 阶段 7：内容交付

### 交付物
\`\`\`markdown
## 交付内容
[最终内容]

---

## 生产信息
- 验收标准：[已满足 X/X 条]
- 审稿轮次：[X 轮]
- 事实核查：[已核查 / 未涉及事实声明]
- 终检结果：通过
\`\`\`

---

## 流程总览

\`\`\`
阶段 0：定义验收标准 ←── HARD GATE（不可跳过）
    ↓
阶段 1：选题构思（发散→评估→收敛）
    ↓
阶段 2：内容大纲（结构+素材需求）
    ↓
阶段 3：内容执行（分段写作+自检）
    ↓ ↑ （不通过则返回修改）
阶段 4：内容审稿（合规审+质量审）
    ↓
   [如有问题] → 阶段 5：内容诊断 → 返回阶段 3 或 4
    ↓
阶段 6：发布前终检
    ↓
阶段 7：内容交付
\`\`\`

### 阶段可跳过规则

| 阶段 | 可跳过？ | 条件 |
|------|---------|------|
| 0 验收标准 | ❌ 永不 | — |
| 1 选题构思 | ✅ | 用户已明确选题 |
| 2 内容大纲 | ✅ | 内容 < 500 字 且 结构简单 |
| 3 内容执行 | ❌ 永不 | — |
| 4 内容审稿 | ✅ | 内容 < 300 字 且 无事实声明 |
| 5 内容诊断 | ✅ | 阶段 4 一次通过 |
| 6 发布前终检 | ✅ | 内容 < 300 字 且 无事实声明 |
| 7 内容交付 | ❌ 永不 | — |

---

## 与其他 Skill 的协作

| 阶段 | 协作 Skill | 协作方式 |
|------|-----------|----------|
| 阶段 0 | super-analyst | 受众分析可用分析框架辅助 |
| 阶段 1 | super-interviewer | 用苏格拉底式对话帮用户理清选题 |
| 阶段 3 | super-writer | Writer Agent 用写作方法论执行 |
| 阶段 4 | super-editor | Editor Agent 用四层编辑方法论审稿 |
| 阶段 4 | super-fact-checker | Fact-checker Agent 核查事实声明 |

**职责边界**：
- super-workflow = **何时做、做什么、怎么检查**（流程纪律）
- super-writer/editor/fact-checker = **怎么做**（专业技法）
- 两者互补，不重叠
`,
}

const superWriterSkill: BuiltinSkill = {
  name: "super-writer",
  description:
    "Professional content creation assistant with 6 writing methodologies (W.R.I.T.E, AIDA, Storytelling, etc.). Use for articles, copy, stories, social posts, emails, marketing content. Triggers: 'write', 'create content', 'draft', 'blog post', 'marketing copy'.",
  template: `# Super Writer

> 理解需求 → 按需准备 → 选方法创作

---

## 工作流程

\`\`\`
问题 → 理解需求 → [简单] 直接写
                → [需素材] 搜索后写
                → [需模仿] 提取风格后写
\`\`\`

**核心原则**：
- 简单任务直接创作，不走流程
- 只在用户明确要求时做风格模仿
- 方法论是工具，不是仪式

### ⚡ 与 super-workflow 协作
如果当前任务已加载 super-workflow，**写前必须确认**：
- 验收标准已定义（阶段 0 已完成）
- 大纲已确认（阶段 2 已完成，如适用）
- 按大纲分段写作，每段完成后对照验收标准自检

---

## 第一步：理解需求

### 快速判断

| 要素 | 确认内容 |
|------|----------|
| 内容类型 | 文章/文案/故事/社媒/邮件/其他 |
| 受众 | 给谁看 |
| 目的 | 达成什么 |
| 长度 | 大概多长 |
| 是否需要素材 | 用户说"查一下"或话题需要背景研究 |
| 是否模仿风格 | 用户明确说"模仿这个风格"/"参考这篇" |

**信息不足直接问**：受众是谁？目的是什么？有没有参考？

---

## 第二步：准备（按需）

### 素材收集（如需要）

1. 明确需要什么类型（数据/案例/趋势/背景）
2. 搜索 2-5 次
3. 中英文协调搜索（如话题有国际维度）
4. 整理关键信息点

### 风格提取（如用户要求模仿）

分析参考内容，提取 5-7 条关键特征：
- 语气（正式/轻松/幽默）
- 人称（第一/二/三人称）
- 句式（长句/短句/交替）
- 段落（短/中/长）
- 修辞（比喻/排比/问句/直白）
- 用词（专业/口语/文艺）
- 特殊习惯（如有）

**提取的风格特征在创作时必须遵守。**

---

## 第三步：选方法 + 创作

### 方法论选择

| 内容类型 | 首选方法论 |
|----------|------------|
| 博客/文章（需研究支撑） | W.R.I.T.E |
| 销售文案/广告/邮件营销 | AIDA |
| 品牌故事/案例/人物特写 | Storytelling |
| 深度指南/白皮书/SEO长文 | Content Writing Process |
| 日常社媒/快速内容 | Content Creation Techniques |
| 高竞争/高转化要求 | High-Value Content Strategies |

### 6 种方法论详解

#### 1. W.R.I.T.E Method
**适合**：需要研究支撑的博客、文章

**步骤**：
1. **Write（初稿）**：快速写出核心观点和框架，不求完美
2. **Research（研究）**：补充数据、案例、引用支撑论点
3. **Ideate（构思）**：优化角度、标题、Hook，找独特切入点
4. **Target（定位）**：检查是否符合目标受众的痛点和语言习惯
5. **Enhance（优化）**：润色语言、检查逻辑、优化可读性

#### 2. AIDA Model
**适合**：销售文案、广告、邮件营销

**步骤**：
1. **Attention（吸引注意）**：强力标题/开头，打断读者思维
2. **Interest（引发兴趣）**：展示与读者相关的问题或痛点
3. **Desire（激发渴望）**：呈现解决方案的好处和价值
4. **Action（促成行动）**：清晰的行动号召（CTA）

#### 3. Storytelling Framework
**适合**：品牌故事、案例、人物特写

**步骤**：
1. **Setup（设定）**：介绍主角和背景
2. **Conflict（冲突）**：呈现问题、挑战或困境
3. **Journey（历程）**：描述应对过程中的努力和挣扎
4. **Climax（高潮）**：转折点或关键决策
5. **Resolution（结局）**：结果和收获，与读者产生共鸣

#### 4. Content Writing Process
**适合**：SEO长文、深度指南、白皮书

**步骤**：
1. **Planning（规划）**：定义目标、受众、关键词、大纲
2. **Research（研究）**：收集权威资料、数据、案例
3. **Writing（写作）**：按大纲展开，注意 SEO 优化
4. **Editing（编辑）**：检查准确性、逻辑、可读性
5. **Publishing（发布）**：格式化、添加图片、内链外链

#### 5. Content Creation Techniques
**适合**：日常社媒、多平台内容、快速迭代

**常用技巧**（按需组合）：
- **Hook-Story-Offer**：钩子吸引 → 故事建立信任 → 提供价值
- **Problem-Agitate-Solve**：提出问题 → 放大痛点 → 给出方案
- **Before-After-Bridge**：现状 → 理想状态 → 如何到达
- **List Post**：数字标题 + 要点列举
- **How-To**：步骤化教程
- **Contrarian**：反常识观点引发讨论

#### 6. High-Value Content Strategies
**适合**：高竞争市场、需要差异化

**策略类型**（选择最适合的）：
- **深度长文**：比竞品更全面、更深入
- **原创研究**：自有数据、调研、案例分析
- **专家访谈**：借势权威背书
- **终极指南**：一站式解决某个问题
- **趋势预测**：前瞻性观点建立思想领导力
- **对比测评**：帮读者做决策

---

## 输出格式

\`\`\`markdown
# [标题]

[正文内容]

---

**创作信息**
- 方法论：[使用的方法论]
- 字数：约 X 字
- 素材：[使用了 X 条素材 / 无需外部素材]
- 风格：[匹配 XX 风格 / 无特定风格要求]

需要调整请告诉我。
\`\`\`

---

## 关键原则

### 不要做
- ❌ 简单任务走复杂流程
- ❌ 用户没要求就主动问"要不要参考风格"
- ❌ 为了用方法论而用方法论
- ❌ 输出冗长的分析过程

### 要做
- ✅ 快速理解，有疑问直接问
- ✅ 简单任务直接写
- ✅ 方法论是指导，不是束缚
- ✅ 用户要改就改，不解释

---

## 迭代协议

| 修改类型 | 处理方式 |
|----------|----------|
| 小改（词句调整） | 直接改，不废话 |
| 中改（段落/结构调整） | 改完说明改了什么 |
| 大改（方向/风格调整） | 确认新方向，重写相关部分 |
| 全部重来 | 确认新需求，重新开始 |
`,
};

const superFactCheckerSkill: BuiltinSkill = {
  name: "super-fact-checker",
  description:
    "Systematic fact-checking methodology for verifying claims, assessing source credibility, and ensuring content accuracy. Use when reviewing content for factual accuracy, validating sources, or building trust through verification.",
  template: `# Super Fact-Checker

> 识别声明 → 评估优先级 → 核查验证 → 标注结果

---

## 工作流程

\`\`\`
内容 → 提取声明 → 分类（可核查/不可核查）
              → 排序（优先级）
              → 验证（找来源）
              → 标注（结果）
\`\`\`

**核心原则**：
- 只核查可核查的声明
- 影响大 + 可疑度高的先查
- 追溯到一手源
- 标注要明确，不模糊

---

## 第一步：提取和分类声明

### 可核查的声明
- ✅ 事实陈述："特斯拉 2024 年交付量为 180 万辆"
- ✅ 数据引用："根据 Gartner 报告..."
- ✅ 历史事件："苹果于 2007 年发布 iPhone"
- ✅ 引用他人言论："马斯克说过..."

### 不可核查的声明
- ❌ 观点/判断："这是最好的解决方案"
- ❌ 预测："明年市场将增长 50%"
- ❌ 主观感受："用户体验很好"
- ❌ 模糊表述："很多人认为..."

**处理**：提取所有声明，标记哪些可核查、哪些不可核查。

---

## 第二步：确定核查优先级

### 优先级矩阵

|  | 可疑度高 | 可疑度低 |
|--|----------|----------|
| **影响大** | 🔴 必须核查 | 🟡 应该核查 |
| **影响小** | 🟡 应该核查 | 🟢 可选核查 |

### 可疑度信号
- 🚩 数字过于精确或过于整齐（"正好 100 万"）
- 🚩 来源模糊（"研究表明"、"专家认为"）
- 🚩 与常识或已知事实冲突
- 🚩 过于绝对的表述（"唯一"、"首次"、"从未"）
- 🚩 转述多次的信息

### 影响评估
- 高影响：核心论点、关键数据、决策依据
- 低影响：背景信息、举例说明、次要细节

---

## 第三步：核查验证

### 来源可信度层级

| 层级 | 来源类型 | 可信度 | 示例 |
|------|----------|--------|------|
| 1 | 官方一手源 | ⭐⭐⭐ | 财报、官方公告、法院文件 |
| 2 | 权威学术源 | ⭐⭐⭐ | 同行评审论文、官方统计 |
| 3 | 权威媒体 | ⭐⭐ | NYT, WSJ, FT, 财新等 |
| 4 | 行业报告 | ⭐⭐ | 麦肯锡、Gartner（注意方法论） |
| 5 | 普通媒体 | ⭐ | 一般新闻网站 |
| 6 | 自媒体/社交 | ⚠️ | 仅作线索，不可作为验证源 |

### 验证方法

**数据类声明**：
1. 找到原始数据源（财报、官方统计）
2. 核对具体数字和单位
3. 确认时间范围

**引用类声明**：
1. 找到原始出处（原文、原视频）
2. 核对是否断章取义
3. 确认说话人身份和语境

**事件类声明**：
1. 找到多个独立报道
2. 交叉验证关键细节
3. 注意时间线和因果关系

### 三角验证
关键声明需要 2-3 个独立来源交叉验证：
- 独立 = 不互相引用、不同机构、不同时间
- 若只有单一来源，标注"单源，待验证"

---

## 第四步：标注结果

### 标注体系

| 标注 | 含义 | 使用场景 |
|------|------|----------|
| ✅ 已验证 | 找到可靠来源，信息准确 | 与一手源/权威源一致 |
| ⚠️ 部分验证 | 核心正确，细节有出入 | 数字略有偏差、表述不够精确 |
| ❓ 无法验证 | 找不到可靠来源 | 来源不明、信息过旧 |
| ❌ 有误 | 与可靠来源冲突 | 数据错误、事实错误 |
| 🔍 需进一步核查 | 重要但当前无法确认 | 需要专业知识或更多时间 |

### 输出格式

\`\`\`markdown
## 核查报告

### 摘要
- 总声明数：X 条
- 可核查：X 条
- 已核查：X 条
- 问题声明：X 条

### 核查结果

| # | 声明 | 结果 | 说明 |
|---|------|------|------|
| 1 | "特斯拉2024年交付180万辆" | ✅ | 与财报一致（来源：Tesla Q4 2024 财报） |
| 2 | "市场份额超过50%" | ⚠️ | 实际为47%（来源：XX报告） |
| 3 | "专家认为..." | ❓ | 未找到具体来源 |

### 建议修改
1. [声明 2]：建议改为"市场份额约47%"
2. [声明 3]：建议删除或补充具体来源

### 来源清单
- [来源1]: URL/引用
- [来源2]: URL/引用
\`\`\`

---

## 关键原则

### 不要做
- ❌ 把"无法验证"当作"有误"
- ❌ 只找支持结论的来源（确认偏误）
- ❌ 用二手源验证二手源
- ❌ 忽略来源的利益相关性

### 要做
- ✅ 追溯到一手源
- ✅ 标注来源的可信度
- ✅ 说明核查过程
- ✅ 区分"事实错误"和"表述不精确"
`,
};

const superEditorSkill: BuiltinSkill = {
  name: "super-editor",
  description:
    "Systematic editing methodology for refining existing content. Covers structural editing, paragraph flow, sentence clarity, and word choice. Use when polishing drafts, improving readability, or ensuring consistency.",
  template: `# Super Editor

> 判断层级 → 从大到小编辑 → 标注修改 → 解释理由

---

## 工作流程

\`\`\`
草稿 → 评估层级 → [结构问题] 结构编辑
              → [段落问题] 段落编辑
              → [句子问题] 句子编辑
              → [词语问题] 词语编辑
\`\`\`

**核心原则**：
- 先大后小：结构 → 段落 → 句子 → 词语
- 不要边写边改，一层一层来
- 每次修改都要有理由
- 尊重作者风格，不过度改写

### ⚡ 与 super-workflow 协作
如果当前任务有验收标准（super-workflow 阶段 0 产出），**审稿时优先执行标准合规审**：
- 第零步：逐条对照验收标准的成功条件和失败条件
- 合规审通过后，再进入四层编辑流程提升质量

---

## 编辑四层级

### 第一层：结构编辑（Structural Editing）

**关注**：整体架构、章节安排、逻辑顺序

**检查清单**：
- [ ] 开头是否抓住读者？
- [ ] 主线是否清晰？
- [ ] 章节顺序是否符合逻辑？
- [ ] 是否有冗余章节？
- [ ] 结尾是否有力？

**常见问题**：
| 问题 | 表现 | 修改建议 |
|------|------|----------|
| 开头太慢 | 背景铺垫过长 | 直接切入，背景后置 |
| 逻辑断层 | A 跳到 C，缺 B | 补充过渡段落 |
| 重复冗余 | 多处说同一件事 | 合并或删除 |
| 虎头蛇尾 | 结尾草草收场 | 加强总结或号召 |

### 第二层：段落编辑（Paragraph Editing）

**关注**：段落内聚、段间过渡、信息密度

**检查清单**：
- [ ] 每段是否只有一个核心观点？
- [ ] 段落之间是否有逻辑连接？
- [ ] 段落长度是否适中（3-7句）？
- [ ] 信息密度是否均匀？

**常见问题**：
| 问题 | 表现 | 修改建议 |
|------|------|----------|
| 段落过长 | 一段超过 10 句 | 按子观点拆分 |
| 段落散乱 | 一段多个主题 | 提取各自成段 |
| 缺乏过渡 | 段落之间跳跃 | 添加过渡句 |
| 信息失衡 | 重点一笔带过，细节长篇大论 | 重新分配篇幅 |

### 第三层：句子编辑（Sentence Editing）

**关注**：清晰度、流畅度、节奏感

**检查清单**：
- [ ] 每句话意思是否明确？
- [ ] 句子长度是否有变化？
- [ ] 是否有歧义或多重否定？
- [ ] 主语是否一致？

**常见问题**：
| 问题 | 表现 | 修改建议 |
|------|------|----------|
| 句子过长 | 一句超过 40 字 | 拆成 2-3 句 |
| 歧义 | "他告诉他的朋友他错了" | 明确指代 |
| 多重否定 | "不是没有可能不..." | 改为肯定句 |
| 被动过多 | "被...所...的..." | 改为主动语态 |

### 第四层：词语编辑（Word Editing）

**关注**：精准用词、一致性、语气

**检查清单**：
- [ ] 用词是否精准？
- [ ] 术语是否一致？
- [ ] 是否有冗余词？
- [ ] 语气是否统一？

**常见问题**：
| 问题 | 表现 | 修改建议 |
|------|------|----------|
| 用词模糊 | "一些"、"很多"、"大概" | 具体化或删除 |
| 术语不一致 | 同一概念多种叫法 | 统一术语 |
| 冗余词 | "非常非常"、"目前现在" | 删除重复 |
| 语气不统一 | 时正式时口语 | 统一风格 |

---

## 修改标注格式

\`\`\`markdown
## 编辑报告

### 编辑摘要
- 编辑层级：[结构/段落/句子/词语]
- 修改数量：X 处
- 主要问题：[简述]

### 修改清单

#### 结构层
1. **[章节名]**
   - 原文：[保持/删除/移动]
   - 修改：[具体操作]
   - 理由：[为什么这么改]

#### 段落层
1. **[位置]**
   - 问题：[段落过长/缺乏过渡/...]
   - 修改：[具体操作]
   - 理由：[为什么]

#### 句子层
1. **原句**："[原文]"
   **改为**："[修改后]"
   **理由**：[清晰度/流畅度/...]

#### 词语层
1. "[原词]" → "[新词]"：[理由]
\`\`\`

---

## 编辑风格指南

### 精简原则
- 删掉不影响意思的词
- 一个词能说清的不用两个词
- 能用简单词的不用复杂词

### 清晰原则
- 避免歧义
- 明确指代
- 少用缩略语（首次出现要解释）

### 一致原则
- 术语统一
- 人称统一
- 时态统一
- 格式统一

---

## 关键原则

### 不要做
- ❌ 改变作者的核心风格
- ❌ 同时改多个层级
- ❌ 无理由地修改
- ❌ 把自己的偏好强加于人

### 要做
- ✅ 尊重作者意图
- ✅ 从大到小、逐层编辑
- ✅ 每处修改都有理由
- ✅ 保留原文供对比
`,
};

const superInterviewerSkill: BuiltinSkill = {
  name: "super-interviewer",
  description:
    "Systematic questioning and dialogue techniques for exploring ideas, uncovering needs, and challenging assumptions. Use for brainstorming sessions, requirement gathering, or deep exploration of complex topics.",
  template: `# Super Interviewer

> 建立信任 → 开放探索 → 深度挖掘 → 总结确认

---

## 工作流程

\`\`\`
对话 → 破冰/建立信任
    → 开放式探索（广度）
    → 追问/深挖（深度）
    → 总结/确认
\`\`\`

**核心原则**：
- 多听少说，让对方主导
- 追问比答案更重要
- 挑战假设，但不对抗
- 总结确认，避免误解

---

## 提问类型

### 按开放度分类

| 类型 | 用途 | 示例 |
|------|------|------|
| **开放式** | 探索、发散 | "你怎么看...？" "能详细说说吗？" |
| **封闭式** | 确认、收敛 | "是 A 还是 B？" "对吗？" |
| **量表式** | 程度评估 | "1-10 分你给几分？" |

### 按功能分类

| 类型 | 用途 | 示例 |
|------|------|------|
| **澄清** | 确保理解正确 | "你说的 X 是指...？" |
| **追问** | 深入细节 | "为什么这么认为？" "能举个例子吗？" |
| **假设** | 探索可能性 | "如果...会怎样？" |
| **挑战** | 测试论点 | "有没有可能...？" "反对的人会怎么说？" |
| **总结** | 确认理解 | "所以你的意思是...？" |

---

## 对话四阶段

### 阶段一：破冰/建立信任

**目标**：让对方放松，愿意真实表达

**技巧**：
- 从简单、安全的话题开始
- 表达真诚的好奇心
- 不急于进入正题
- 适当自我暴露（分享相关经历）

**示例开场**：
- "在开始之前，能先介绍一下你的背景吗？"
- "你是怎么开始关注这个领域的？"

### 阶段二：开放探索（广度）

**目标**：了解全貌，发现意外话题

**技巧**：
- 用开放式问题开始
- 不打断，让对方说完
- 记录关键词，稍后追问
- 保持中立，不表态

**万能开放问题**：
- "能说说你对 X 的看法吗？"
- "你觉得最重要的是什么？"
- "如果要给别人解释这件事，你会怎么说？"

### 阶段三：深度挖掘

**目标**：深入关键话题，挖掘深层需求

**技巧**：

#### 5 Whys（连续追问）
\`\`\`
"为什么觉得这很重要？" → 回答
"为什么会这样？" → 回答
"为什么...？" → 继续追问
（直到触及根本原因）
\`\`\`

#### 需求挖掘三层
| 层级 | 问题 | 示例 |
|------|------|------|
| 表面需求 | 你想要什么？ | "我想要一个更快的报表工具" |
| 深层需求 | 为什么想要？ | "因为现在做报表太慢，影响决策" |
| 核心动机 | 这对你意味着什么？ | "我需要在老板面前显得有准备" |

#### 假设性问题
- "如果资源无限，你会怎么做？"
- "如果这个限制不存在呢？"
- "最理想的情况是什么样的？"

### 阶段四：总结确认

**目标**：确保理解一致，避免误解

**技巧**：
- 用自己的话复述关键点
- 明确请求对方确认
- 捕捉遗漏或误解
- 给对方补充的机会

**总结模板**：
\`\`\`
"让我总结一下，确保我理解对了：

1. 你主要关心的是 [X]
2. 最大的挑战是 [Y]
3. 理想的结果是 [Z]

我理解得对吗？有什么需要补充的？"
\`\`\`

---

## 苏格拉底式对话

**用途**：挑战假设、深度思考、理清逻辑

### 核心技巧

#### 1. 概念澄清
- "你说的 X 具体是什么意思？"
- "能给 X 下个定义吗？"
- "X 和 Y 有什么区别？"

#### 2. 假设质疑
- "这个结论基于什么假设？"
- "如果这个假设不成立呢？"
- "有没有其他可能的解释？"

#### 3. 后果探索
- "如果按这个方向走，会发生什么？"
- "最坏的情况是什么？"
- "谁会反对？他们的理由是什么？"

#### 4. 类比测试
- "有没有类似的情况可以参考？"
- "如果换一个场景，这个逻辑还成立吗？"

#### 5. 元问题
- "为什么这个问题重要？"
- "你为什么会这么问？"
- "回答这个问题对你有什么帮助？"

---

## 常见陷阱

| 陷阱 | 表现 | 避免方法 |
|------|------|----------|
| **引导性问题** | "你不觉得 X 很好吗？" | 改为中立："你怎么看 X？" |
| **急于给答案** | 对方还没说完就插嘴 | 等对方说完，数到 3 再回应 |
| **确认偏误** | 只听到支持自己观点的部分 | 主动追问反面观点 |
| **过度追问** | 让对方感到被审问 | 穿插轻松话题，表达理解 |
| **忽略情绪** | 只关注内容，忽略对方感受 | 适时回应情绪："听起来这让你很frustrated" |

---

## 关键原则

### 不要做
- ❌ 用问题引导对方到预设答案
- ❌ 同时问多个问题
- ❌ 打断对方
- ❌ 评判对方的回答

### 要做
- ✅ 真诚好奇
- ✅ 一次一个问题
- ✅ 等对方说完再追问
- ✅ 总结确认理解
`,
};

const superObsidianSkill: BuiltinSkill = {
  name: "super-obsidian",
  description:
    "MUST USE when working in an Obsidian vault (.obsidian/ directory detected). Complete Obsidian CLI command reference for searching, reading, creating, and managing notes. Obsidian's native search engine is far superior to grep/rg file traversal. Triggers: 'Obsidian vault', 'obsidian search', 'note search', environment shows 'Is Obsidian vault: yes'.",
  template: `# Super Obsidian — CLI-First Knowledge Base Operations

> 检测环境 → 用 Obsidian CLI 搜索/读写 → 永远不直接遍历 .md 文件

---

## 前提条件

1. **Obsidian App 必须正在运行**（CLI 是 App 的遥控器，不是独立工具）
2. CLI 已在 Settings → General → Command line interface 中启用
3. \`obsidian\` 命令在 PATH 中可用

**验证**：
\`\`\`bash
obsidian version
\`\`\`

如果命令不存在，提示用户：
- macOS: 在 Obsidian 设置中启用 CLI，会自动添加到 PATH
- 手动添加: 将 Obsidian 可执行文件路径加入 PATH

---

## 核心原则

1. **搜索必用 CLI**：\`obsidian search\` 使用 Obsidian 原生搜索引擎，效果远优于 grep/rg 遍历 .md 文件
2. **走正门**：通过 CLI 操作保证索引一致性，避免直接读写文件系统导致索引错乱
3. **引号规则**：参数有空格必须双引号，换行用 \`\\n\`
4. **file 参数**：通常不需要 \`.md\` 后缀，Obsidian 自动解析；路径相对于 vault 根目录

---

## 命令速查

### 🔍 搜索（最重要 — 替代 grep/rg）

| 命令 | 用途 | 示例 |
|------|------|------|
| \`obsidian search query="关键词"\` | 全文搜索 | \`obsidian search query="项目规划" --copy\` |
| \`obsidian search:context query="关键词" limit=N\` | 带上下文的全文搜索 | \`obsidian search:context query="瓶颈" limit=10\` |
| \`obsidian backlinks file="笔记名"\` | 查反向链接（谁引用了这篇） | \`obsidian backlinks file="项目A"\` |
| \`obsidian links file="笔记名"\` | 查外链（这篇引用了谁） | \`obsidian links file="项目A"\` |
| \`obsidian orphans\` | 查找孤立笔记（无链接） | |
| \`obsidian tags\` | 列出所有标签 | |
| \`obsidian tasks\` | 显示所有任务 | |
| \`obsidian random\` | 随机打开一篇笔记 | |

### 📖 读取

| 命令 | 用途 | 示例 |
|------|------|------|
| \`obsidian read file="笔记名"\` | 读取笔记内容 | \`obsidian read file="年度计划" --copy\` |
| \`obsidian daily:read\` | 读取今日日记 | |
| \`obsidian outline file="笔记名"\` | 获取笔记大纲 | |
| \`obsidian wordcount\` | 字数统计 | |
| \`obsidian bookmarks\` | 书签列表 | |

### ✏️ 写入 / 创建

| 命令 | 用途 | 示例 |
|------|------|------|
| \`obsidian create name="标题" content="内容"\` | 创建新笔记 | \`obsidian create name="会议记录" content="# 会议\\n- 议题1" open\` |
| \`obsidian append path="文件.md" content="文字"\` | 追加到指定笔记 | \`obsidian append path="项目日志.md" content="\\n## 进展\\n..."\` |
| \`obsidian prepend path="文件.md" content="文字"\` | 前插到指定笔记 | |
| \`obsidian daily:append content="文字"\` | 追加到今日日记 | \`obsidian daily:append content="- [ ] 买牛奶"\` |
| \`obsidian daily:prepend content="文字"\` | 前插到今日日记 | |

### 📅 日记（Daily Notes）

| 命令 | 用途 |
|------|------|
| \`obsidian daily\` | 打开今日笔记 |
| \`obsidian daily:path\` | 显示今日笔记路径 |
| \`obsidian daily:read\` | 读取今日笔记内容 |
| \`obsidian daily:append content="..."\` | 追加到今日笔记 |
| \`obsidian daily:prepend content="..."\` | 前插到今日笔记 |

### 📝 属性 / 标签 / 任务

| 命令 | 用途 | 示例 |
|------|------|------|
| \`obsidian property:set file="笔记" name="键" value="值"\` | 设置 YAML 属性 | \`obsidian property:set file="项目A" name="status" value="done"\` |
| \`obsidian tags\` | 列出所有标签 | |
| \`obsidian task ref="文件:行号" toggle\` | 切换任务完成状态 | |

### 📂 文件管理

| 命令 | 用途 | 示例 |
|------|------|------|
| \`obsidian open file="笔记名"\` | 打开笔记 | |
| \`obsidian move file="旧名" to="新路径"\` | 移动/重命名 | |
| \`obsidian rename file="旧名" name="新名"\` | 重命名 | |
| \`obsidian delete file="笔记名"\` | 删除（加 \`permanent\` 永久删除） | |

### 🗄️ Vault / 插件 / 工作区

| 命令 | 用途 |
|------|------|
| \`obsidian vaults\` | 列出所有 vault |
| \`obsidian vault:open name="vault名"\` | 切换 vault |
| \`obsidian plugins\` | 列出插件 |
| \`obsidian plugin:enable id="插件ID"\` | 启用插件 |
| \`obsidian workspace:save name="工作区名"\` | 保存工作区 |
| \`obsidian workspace:load name="工作区名"\` | 加载工作区 |

### 🛠️ 开发者 / 高级

| 命令 | 用途 |
|------|------|
| \`obsidian eval code="JS代码"\` | 执行 Obsidian 内部 JS API |
| \`obsidian devtools\` | 打开开发者工具 |
| \`obsidian dev:screenshot\` | 截图 |
| \`obsidian help\` | 查看全部命令 |
| \`obsidian help <命令>\` | 查看具体命令帮助 |
| \`obsidian reload\` | 重载窗口 |

---

## 典型工作流

### 搜索 → 阅读 → 总结追加

\`\`\`bash
# 1. 搜索相关笔记
obsidian search query="项目规划"

# 2. 读取最相关的笔记
obsidian read file="2026年项目规划"

# 3. 追加 AI 总结
obsidian append path="2026年项目规划.md" content="\\n---\\n## AI 总结\\n要点1...\\n要点2..."
\`\`\`

### 日记工作流

\`\`\`bash
# 查看今日日记
obsidian daily:read

# 追加记录
obsidian daily:append content="\\n## 工作记录\\n- 完成了 X 功能\\n- 发现了 Y 问题"

# 追加待办
obsidian daily:append content="\\n- [ ] 明天跟进 Z"
\`\`\`

### 知识图谱探索

\`\`\`bash
# 查看某个笔记被谁引用
obsidian backlinks file="核心概念A"

# 查看某个笔记引用了什么
obsidian links file="核心概念A"

# 找到孤立笔记（可能需要整理）
obsidian orphans
\`\`\`

### 批量属性管理

\`\`\`bash
# 标记笔记状态
obsidian property:set file="项目A" name="status" value="completed"
obsidian property:set file="项目B" name="priority" value="high"
\`\`\`

---

## ⚠️ 注意事项

1. **Obsidian 必须运行**：所有 CLI 命令都通过 App 执行，App 关闭则全部失败
2. **不要直接修改 .md 文件**：会导致 Obsidian 索引错乱，用 CLI 的 append/prepend/create
3. **搜索结果格式**：CLI 返回纯文本，可以直接解析
4. **content 中的换行**：使用 \`\\n\`，不要使用实际换行符
5. **--copy 标志**：将结果复制到系统剪贴板，适合快速传递
6. **open / newtab 标志**：在 Obsidian UI 中打开笔记（create、open 等命令可用）

---

## 何时回退到文件系统操作

仅在以下情况直接操作文件：
- Obsidian App 未运行且无法启动
- 需要批量处理超出 CLI 能力的操作（如正则替换所有文件）
- 处理 .obsidian/ 配置文件本身

其他所有情况，**一律使用 Obsidian CLI**。
`,
};

export function createBuiltinSkills(): BuiltinSkill[] {
  return [
    playwrightSkill,
    superWorkflowSkill,
    superAnalystSkill,
    superWriterSkill,
    superFactCheckerSkill,
    superEditorSkill,
    superInterviewerSkill,
    superObsidianSkill,
  ];
}
