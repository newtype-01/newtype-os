export const WIKI_TEMPLATE = `# /wiki

Generate and maintain a structured project wiki with KNOWLEDGE.md (global summary) and .opencode/wiki/ (deep knowledge base).

## Usage

\`\`\`
/wiki                    # Full project: generate KNOWLEDGE.md + .opencode/wiki/
/wiki [path]             # Deep-dive a specific directory or file
/wiki lint               # Health check: orphan pages, stale content, broken links
/wiki --create-new       # Delete existing wiki and regenerate from scratch
/wiki --max-depth=3      # Limit directory scan depth (default: 5)
\`\`\`

---

## Mode Detection

Parse \\\`$ARGUMENTS\\\` to determine mode:

1. **No arguments or flags only** → Global mode
2. **\\\`lint\\\`** → Lint mode
3. **A file/directory path** → Targeted mode

---

## Global Mode (default)

Generates two outputs:
1. \\\`KNOWLEDGE.md\\\` at project root — high-level project summary for AI context
2. \\\`.opencode/wiki/\\\` directory — structured deep knowledge base

### Workflow

<critical>
**TodoWrite ALL phases. Mark in_progress → completed in real-time.**
\\\`\\\`\\\`
TodoWrite([
  { content: "Scan project structure and file types", status: "pending", priority: "high" },
  { content: "Analyze content: read key files, extract summaries", status: "pending", priority: "high" },
  { content: "Generate KNOWLEDGE.md (project root)", status: "pending", priority: "high" },
  { content: "Generate .opencode/wiki/ structure", status: "pending", priority: "high" },
  { content: "Write meta.json for incremental updates", status: "pending", priority: "high" },
  { content: "Review and validate output", status: "pending", priority: "medium" }
])
\\\`\\\`\\\`
</critical>

### Phase 1: Directory Scan

\\\`\\\`\\\`bash
# Get directory tree (exclude hidden, node_modules, etc.)
find . -type d -not -path '*/\\\\.*' -not -path '*/node_modules/*' -not -path '*/__pycache__/*' | head -100

# Count files by type
find . -type f -not -path '*/\\\\.*' | sed 's/.*\\\\.//' | sort | uniq -c | sort -rn | head -20

# List document files
find . -type f \\\\( -name "*.md" -o -name "*.pdf" -o -name "*.docx" -o -name "*.txt" \\\\) -not -path '*/\\\\.*' | head -100

# Check for existing KNOWLEDGE.md or wiki
find . -type f \\\\( -name "KNOWLEDGE.md" -o -name "README.md" \\\\) -not -path '*/\\\\.*'
ls -la .opencode/wiki/ 2>/dev/null

# File count per directory (top 30)
find . -type f -not -path '*/\\\\.*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30
\\\`\\\`\\\`

Build a mental model:
\\\`\\\`\\\`
CONTENT_PROFILE:
  code: N (ts, js, py, go, rs, etc.)
  documents: N (md, pdf, docx, txt)
  config: N (json, yaml, toml)
  other: N

STRUCTURE_TYPE: flat | shallow | deep | monorepo
LANGUAGE: primary language(s)
FRAMEWORK: detected framework(s)
\\\`\\\`\\\`

### Phase 2: Content Analysis

For each major module/directory:
1. Read README.md / INDEX.md if exists
2. Read main entry files (index.ts, main.ts, etc.)
3. Identify exports, public APIs, key abstractions
4. Note architectural patterns and design decisions

For code projects, focus on:
- Entry points and main flows
- Module boundaries and dependencies
- Key abstractions (interfaces, types, base classes)
- Configuration and environment setup

### Phase 3: Generate KNOWLEDGE.md

Write to project root. This is a **concise global summary** (50-200 lines).

\\\`\\\`\\\`markdown
# KNOWLEDGE BASE INDEX

**Generated:** {TIMESTAMP}
**Last Updated:** {DATE}
**Total Files:** {N} code, {N} docs, {N} config, {N} other

---

## OVERVIEW

{2-4 sentences: what this project is, its purpose, primary tech stack}

---

## ARCHITECTURE

\\\\\\\`\\\\\\\`\\\\\\\`
{project}/
├── {dir1}/        # {purpose}
│   └── ...
├── {dir2}/        # {purpose}
└── {file}         # {description}
\\\\\\\`\\\\\\\`\\\\\\\`

---

## KEY MODULES

| Module | Purpose | Entry Point |
|--------|---------|-------------|
| {name} | {what it does} | {path} |

---

## TOPICS & CONCEPTS

- **{Concept 1}**: {brief explanation, related files}
- **{Concept 2}**: {brief explanation, related files}

---

## NOTES

- {Architectural decisions}
- {Naming conventions}
- {Important patterns}
\\\`\\\`\\\`

### Phase 4: Generate .opencode/wiki/

Create the wiki directory structure:

\\\`\\\`\\\`
.opencode/wiki/
├── meta.json           # Wiki metadata for incremental updates
├── purpose.md          # Why this wiki exists, how to use it
├── schema.md           # Page types, naming rules, conventions
├── index.md            # Content directory with links
├── log.md              # Operation log (generation history)
├── overview.md         # Detailed project overview
├── entities/           # Entity pages (modules, classes, APIs, functions)
│   ├── {module-name}.md
│   └── ...
├── concepts/           # Concept pages (patterns, architecture decisions)
│   ├── {concept-name}.md
│   └── ...
├── sources/            # Source file summaries (1 per major source dir)
│   ├── {dir-name}.md
│   └── ...
└── synthesis/          # Cross-module analysis
    ├── dependencies.md
    └── data-flow.md
\\\`\\\`\\\`

#### meta.json format:
\\\`\\\`\\\`json
{
  "version": 1,
  "created_at": "{ISO timestamp}",
  "last_updated": "{ISO timestamp}",
  "content_hash": "{sha256 of file tree snapshot}",
  "update_interval_hours": 48,
  "pages": {
    "{relative-path}": {
      "hash": "{content hash}",
      "updated_at": "{ISO timestamp}"
    }
  }
}
\\\`\\\`\\\`

#### Page writing rules:
- **purpose.md**: 3-5 sentences on what this wiki is for
- **schema.md**: Define page types (entity, concept, source, synthesis), naming rules (kebab-case), link format
- **index.md**: Table of contents linking all pages
- **log.md**: Append-only log of wiki operations with timestamps
- **overview.md**: Expanded version of KNOWLEDGE.md with more detail
- **entities/**: One page per significant module, class, or API. Include: purpose, public interface, dependencies, usage examples
- **concepts/**: One page per architectural pattern or design decision. Include: what, why, where used, tradeoffs
- **sources/**: One page per major source directory. Include: file listing, purpose, key exports
- **synthesis/**: Cross-cutting analysis. dependencies.md maps inter-module deps. data-flow.md traces key data paths

### Phase 5: Write meta.json

Generate content_hash from the project file tree (file paths + sizes + mtimes).
Write meta.json with all page hashes for future incremental updates.

### Phase 6: Review

1. Verify all file paths in wiki pages are correct
2. Ensure KNOWLEDGE.md is 50-200 lines
3. Check index.md links match actual pages
4. Remove any generic/unhelpful content

---

## Targeted Mode (\\\`/wiki [path]\\\`)

Deep-dive a specific directory or file. Generates/updates pages under \\\`.opencode/wiki/\\\` for that scope only.

### Workflow

1. Verify the target path exists
2. Read all files in the target (respect --max-depth)
3. Generate/update relevant pages:
   - \\\`sources/{dir-name}.md\\\` — file listing and summaries
   - \\\`entities/{name}.md\\\` — for each significant export/class/module found
   - \\\`concepts/{name}.md\\\` — for any patterns discovered
4. Update \\\`index.md\\\` to include new pages
5. Update \\\`meta.json\\\` with new page hashes
6. Append operation to \\\`log.md\\\`

---

## Lint Mode (\\\`/wiki lint\\\`)

Health check for wiki consistency.

### Checks

1. **Orphan pages**: Pages in wiki/ not linked from index.md
2. **Broken links**: Links in wiki pages pointing to non-existent pages
3. **Stale content**: Pages whose source files have changed (compare meta.json hashes)
4. **Missing coverage**: Major modules/directories with no wiki page
5. **Empty pages**: Pages with no meaningful content

### Output format

\\\`\\\`\\\`
=== Wiki Lint Report ===

✅ Passed: {N} checks
⚠️ Warnings: {N}
❌ Errors: {N}

[STALE] entities/auth.md — source changed since last update
[ORPHAN] concepts/old-pattern.md — not linked from index.md
[MISSING] sources/api/ — no wiki page for src/api/
[EMPTY] synthesis/data-flow.md — no content
\\\`\\\`\\\`

Offer to fix issues automatically after showing the report.

---

## Final Report

\\\`\\\`\\\`
=== /wiki Complete ===

Mode: {global|targeted|lint}
Repository: {path}
Files Analyzed: {N}

Generated:
  - ./KNOWLEDGE.md ({N} lines)
  - .opencode/wiki/ ({N} pages)

Key Findings:
  - {Primary language/framework}
  - {Architecture pattern}
  - {Notable modules}
\\\`\\\`\\\`

---

## Anti-Patterns

- **Don't be verbose** — Wiki pages should be concise reference material, not essays
- **Don't list every file** — Focus on key/representative files and modules
- **Don't duplicate** — KNOWLEDGE.md is the summary, wiki/ has the detail. Don't repeat
- **Don't assume** — Only document what you actually found in the code
- **Don't skip binaries** — PDFs and images may contain key information (use look_at)
- **Don't ignore patterns** — Document discovered conventions and architectural decisions`
