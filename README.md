# @simpill

A collection of lightweight, type-safe TypeScript utility packages for modern JavaScript applications.

## Philosophy

- **Minimal** - Each package does one thing well with minimal dependencies
- **Type-safe** - Full TypeScript support with strict mode enabled
- **Tested** - 80%+ code coverage required for all packages
- **Consistent** - Unified code style, structure, and tooling across all packages

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@simpill/env.utils`](./env.utils) | Type-safe environment variable utilities for Node.js and Edge Runtime | ✅ Stable |
| [`@simpill/logger.utils`](./logger.utils) | Structured logging with correlation context | 🚧 In Development |

## Quick Start

Install any package independently:

```bash
npm install @simpill/env.utils
npm install @simpill/logger.utils
```

## Repository Structure

```
@simpill/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── {pkg}-ci.yml        # CI workflow per package
│       └── {pkg}-release.yml   # Release workflow per package
├── .claude/                    # AI assistant skills
│   └── skills/
├── .cursor/                    # Cursor IDE configuration
│   └── commands/
├── env.utils/                  # @simpill/env.utils package
├── logger.utils/               # @simpill/logger.utils package
├── AGENTS.md                   # Repository guidelines for AI agents
├── CLAUDE.md                   # Claude-specific instructions
├── CONTRIBUTING.md             # How to create new packages
└── README.md                   # This file
```

## Development

Each package is self-contained with its own dependencies and scripts. Navigate to a package directory to work on it:

```bash
cd env.utils

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint & format
npm run check:fix
```

## Creating a New Package

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions on creating new packages.

## Code Quality Standards

All packages must meet these requirements:

- **TypeScript strict mode** enabled
- **80%+ test coverage** (enforced)
- **Biome** for linting and formatting
- **Jest** for testing
- **Pre-push hooks** for quality gates

## Versioning

Each package is versioned independently following [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backwards compatible)
- **PATCH** - Bug fixes (backwards compatible)

## License

ISC
