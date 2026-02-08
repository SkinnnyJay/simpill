# Repository Guidelines

This monorepo hosts lightweight, type-safe TypeScript utility packages under the `@simpill` namespace.

**For detailed instructions on creating new packages, see [CONTRIBUTING.md](./CONTRIBUTING.md).**

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@simpill/env.utils` | Type-safe environment variable utilities | ✅ Stable |
| `@simpill/logger.utils` | Structured logging with correlation context | 🚧 In Development |

## Project Structure

```
@simpill/
├── {name}.utils/               # Each package follows the same structure
│   ├── src/                    # Source code
│   │   ├── client/             # Edge/browser runtime (no fs)
│   │   ├── server/             # Node.js runtime (full access)
│   │   └── shared/             # Runtime-agnostic utilities
│   ├── __tests__/              # Tests (mirrors src/ structure)
│   ├── scripts/                # Build/check scripts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── biome.json
├── .github/workflows/          # CI/CD per package
├── CONTRIBUTING.md             # Package creation guide
└── README.md                   # Monorepo overview
```

## Development Commands

Run from any package directory (e.g., `cd env.utils`):

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage reports |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |
| `npm run check:fix` | Fix all lint and format issues |
| `npm run verify` | Run all pre-push checks |

## Coding Standards

- **TypeScript strict mode** required
- **Biome** for linting/formatting (2-space indent, double quotes, semicolons, 100-char lines)
- **80%+ test coverage** enforced
- **400 line max** per file

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `EnvManager` |
| Functions/Variables | camelCase | `getEnvString` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| Files | dot-separated | `env.utils.ts` |
| Tests | `{name}.unit.test.ts` | `env-manager.unit.test.ts` |

## Commit Guidelines

- Use short, imperative messages: `Add edge env helpers`
- Keep PRs focused with summary and test commands
- Link related issues

## Security

- Never commit `.env` files (git-ignored)
- Document environment variable defaults
- Add tests for parsing behavior
