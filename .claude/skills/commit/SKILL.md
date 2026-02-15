---
name: commit
description: Logically groups changed files into atomic commits with conventional format. Use when ready to commit staged work.
---

# Smart Commit

Group changed files into logical, atomic commits using the project's conventional commit format.

## Commit Format

```
<type>(<scope>): <summary>
```

- **Types**: feat, fix, chore, refactor, docs, test
- **Scope**: affected area (package name, api, ui, etc.)
- **Summary**: present tense, imperative mood, under 72 chars

## Examples

```
feat(async.utils): add retry logic to polling manager
fix(api): handle null in schedule-runs endpoint
chore(deps): bump next to 14.2.1
refactor(collections.utils): extract storage interface
docs(readme): update architecture diagram
test(e2e): add flow spec
```

## Process

1. Run `git status` and `git diff --staged` to see all changes
2. Analyze changed files and group by logical change
3. Stage each group: `git add <files>`
4. Commit with proper format
5. Repeat for each logical group
6. Verify with `git log --oneline -5`

## Rules

- One logical change per commit
- Never commit `.env`, credentials, or secrets
- Run `npm run lint && npm run typecheck` before committing
