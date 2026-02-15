# .claude

Claude Code (claude.ai/code) project configuration.

## Contents

- **skills/** – Project skills (Cursor/Claude). One folder per skill with `SKILL.md`. Canonical location for skill definitions.
- **docs/** – Architecture and API reference. Not Cursor rules.
- **rules/** – Cursor rules live in `.cursor/rules/`. This folder contains a pointer README only.
- **agents/** – Agent definitions live in `.cursor/agents/`. This folder contains a pointer README only.
- **settings.local.json** – Claude Code permissions (npm, npx, Bash, WebFetch). Adjust per project.

## Conventions

Format, structure, and naming for skills (and commands, rules, agents) are documented in **.cursor/CONVENTIONS.md**. Skills use kebab-case names, frontmatter with `name` and `description`, and consistent sections (When to Use, Process, Pass/Fail Criteria).
