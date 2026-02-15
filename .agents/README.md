# .agents

Skills and references for agent toolchains (e.g. Codex, other runners) that are not the primary Cursor/Claude project skills.

## Contents

- **skills/** – Skill packs (Vitest, shadcn-ui, Next.js patterns, audit-website, etc.). Each skill lives in its own folder with a `SKILL.md` and optional `references/` or rule files.

## Relationship to .claude and .cursor

- **Project skills** used by Cursor and Claude Code live in **.claude/skills/** (build-project, typecheck, test-suite, bug-hunter, etc.).
- **.agents/skills/** holds toolchain-specific or shared reference skills (testing frameworks, UI libraries, audits) that may be installed or referenced by other environments.
- **Commands, rules, and agents** are defined in **.cursor/**; see `.cursor/README.md` and `.cursor/CONVENTIONS.md` for structure and naming.

## Skill structure

For consistency, each skill in `.agents/skills/<name>/` should have:

- **SKILL.md** with YAML frontmatter: `name` (kebab-case), `description` (one line; end with "Use when..." or "Use to...").
- Optional: **When to Use**, **Process**, **Pass/Fail Criteria** or **Rules**, and reference subdocs in a `references/` folder.

See `.cursor/CONVENTIONS.md` for the full skill file format.
