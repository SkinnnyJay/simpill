# Conventions: Commands, Skills, Rules, Agents

This document defines structure, naming, and formatting for Cursor/Claude artifacts so they stay consistent across `.cursor/`, `.claude/`, and `.agents/`.

## Canonical Locations

| Artifact | Path | Notes |
|----------|------|--------|
| **Commands** | `.cursor/commands/*.md` | One file per command; Cursor palette |
| **Rules** | `.cursor/rules/*.mdc` | Cursor rules with frontmatter |
| **Agents** | `.cursor/agents/*.md` | Single source; `.claude/agents` points here |
| **Skills** | `.claude/skills/<name>/SKILL.md` | Project skills (Cursor/Claude) |
| **Other skills** | `.agents/skills/<name>/SKILL.md` | Toolchain skills (Vitest, shadcn, etc.) |

## Naming

- **Commands**: kebab-case, verb or action (e.g. `build`, `test`, `typecheck`, `lint`, `e2e`, `coverage`, `commit`, `review`).
- **Skills**: kebab-case, descriptive (e.g. `build-project`, `format-and-lint`, `typecheck`, `test-suite`, `e2e-expert`, `coverage-report`, `bug-hunter`).
- **Agents**: kebab-case (e.g. `code-reviewer`, `verifier`, `test-runner`).
- **Rules**: kebab-case filenames (e.g. `code-style.mdc`, `fixing-workflow.mdc`).

## Command Files (`.cursor/commands/*.md`)

**Frontmatter:**

```yaml
---
description: One-line sentence. What the command does and when to use it.
---
```

**Body structure:**

1. `# <Title>` — Title case (e.g. "Run Tests", "Type Check").
2. `## Overview` — Short paragraph; include monorepo context when relevant (single package vs root make targets).
3. `## Steps` — Numbered list; for fix-type commands, reference the fixing-workflow rule.
4. `## Checklist` — Bullet list of `- [ ]` items.

Keep steps and checklist aligned so completing the steps satisfies the checklist.

## Skill Files (`SKILL.md` in skill folder)

**Frontmatter:**

```yaml
---
name: <kebab-case>
description: One-line. End with "Use when..." or "Use to..." for discoverability.
---
```

Optional: `license`, `compatibility`, `metadata`, `allowed-tools` (e.g. in `.agents` skills).

**Body structure (task-oriented skills):**

1. `# <Title>` — Title case.
2. `## When to Use` (optional) — When to invoke this skill.
3. `## Process` — Numbered steps.
4. `## Pass Criteria` / `## Fail Criteria` or `## Rules` — Clear success/failure conditions.

**Body structure (persona/role skills):** Keep custom sections (e.g. Operating Modes, Output Format) but ensure frontmatter and opening paragraph are consistent.

## Rule Files (`.cursor/rules/*.mdc`)

**Frontmatter:**

```yaml
---
description: "Short summary. Use quotes if the description contains colons."
alwaysApply: true
---
```

**Body:** `# <Title>` then `##` sections as needed. No code blocks unless necessary.

## Agent Files (`.cursor/agents/*.md`)

**Frontmatter:**

```yaml
---
name: <kebab-case>
description: One-line. "Use when..." or "Use to..." for when to select this agent.
readonly: true   # optional
model: fast      # optional
is_background: true  # optional
---
```

**Body:** `# <Title>` (Title case), then `##` sections. Keep content repo-agnostic or reference "this repo" / "the codebase" rather than a specific product name.

## Quality and Numbers

- **Coverage threshold:** This monorepo enforces **80%** (branches, functions, lines, statements). Commands, skills, and agents that mention coverage must use 80%, not 70%.
- **Fixing workflow:** Commands that fix errors (build, typecheck, test, lint, e2e) should reference the project rule "Fixing Workflow" so the agent discovers all failures first, creates a task list, then fixes one-by-one.
