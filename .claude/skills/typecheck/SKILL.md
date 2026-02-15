---
name: typecheck
description: Run TypeScript type checking and fix all type errors. Use when verifying type safety before committing.
---

# Type Check

Run TypeScript type checking and resolve all errors. When fixing errors, follow the project's fixing workflow: discover all type errors, create a task list, fix one at a time without using `any` or `as`, then re-run typecheck to confirm.

## Process

1. Run `npm run typecheck` (or `npx tsc --noEmit`)
2. Read and interpret each type error
3. Fix with minimal, correct changes:
   - Add proper type annotations
   - Fix type mismatches
   - Never use `any` as a shortcut
4. Re-run until clean

## Pass Criteria

- `npm run typecheck` exits with code 0, zero diagnostics

## Fail Criteria

- Type errors remain
- Unsafe fixes introduced (e.g., `any`, `@ts-ignore`)
