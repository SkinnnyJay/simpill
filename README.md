<p align="center">
  <img src="./logo.png" alt="@simpill" width="100%" />
</p>

<p align="center">
  <strong>A collection of lightweight, type-safe TypeScript utility packages for modern JavaScript applications.</strong>
</p>

<p align="center">
  <a href="#philosophy">Philosophy</a> •
  <a href="#packages">Packages</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#repository-structure">Repository Structure</a> •
  <a href="#development">Development</a>
</p>

---

## Philosophy

- **Minimal** - Each package does one thing well with minimal dependencies
- **Type-safe** - Full TypeScript support with strict mode enabled
- **Tested** - 80%+ code coverage required for all packages
- **Consistent** - Unified code style, structure, and tooling across all packages

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@simpill/env.utils`](./utils/env.utils) | Type-safe environment variable utilities for Node.js and Edge Runtime | ✅ Stable |
| [`@simpill/logger.utils`](./utils/logger.utils) | Structured logging with correlation context | 🚧 In Development |
| [`@simpill/object.utils`](./utils/object.utils) | Object utilities: pick, omit, merge, get/set by path, guards, immutable | ✅ Stable |
| [`@simpill/misc.utils`](./utils/misc.utils) | Backend misc: singleton, debounce, throttle, LRU/bounded, polling, intervals, enums, UUID, once, memoize | 🆕 New |
| [`@simpill/cache.utils`](./utils/cache.utils) | LRU map, in-memory cache, TTL cache, Redis cache, memoize | 🆕 New |
| [`@simpill/async.utils`](./utils/async.utils) | Async: raceWithTimeout, delay, retry, Semaphore, Mutex, parallelMap, pool | 🆕 New |
| [`@simpill/function.utils`](./utils/function.utils) | Function: debounce, throttle, once, pipe, compose, arguments, annotations | 🆕 New |
| [`@simpill/string.utils`](./utils/string.utils) | String: formatting, builders, casing, rich text | 🆕 New |
| [`@simpill/test.utils`](./utils/test.utils) | Test patterns, faker wrapper, enricher, vitest/jest helpers | 🆕 New |
| [`@simpill/events.utils`](./utils/events.utils) | PubSub, observer, typed event emitter | 🆕 New |
| [`@simpill/data.utils`](./utils/data.utils) | Data: validate, prepare, lifecycle, extend, config | 🆕 New |
| [`@simpill/time.utils`](./utils/time.utils) | Date/time: getUnixTimeStamp, add* (days/hours/…), diff, delta, debounce, throttle, interval manager | ✅ Stable |
| [`@simpill/uuid.utils`](./utils/uuid.utils) | UUID: generate (v1/v4/v5), validate, parseUUID, compareUUIDs | ✅ Stable |
| [`@simpill/crypto.utils`](./utils/crypto.utils) | Hash, randomBytes, timing-safe compare (Node) | 🆕 New |
| [`@simpill/file.utils`](./utils/file.utils) | readFileUtf8, readFileJson, writeFileUtf8, writeFileJson, ensureDir (Node) | 🆕 New |
| [`@simpill/errors.utils`](./utils/errors.utils) | AppError, error codes, serializeError | 🆕 New |
| [`@simpill/patterns.utils`](./utils/patterns.utils) | Result/Either, strategySelector, pipeAsync | 🆕 New |
| [`@simpill/factories.utils`](./utils/factories.utils) | createFactory, singletonFactory, errorFactory | 🆕 New |
| [`@simpill/adapters.utils`](./utils/adapters.utils) | createAdapter, LoggerAdapter, CacheAdapter, memoryCacheAdapter | 🆕 New |
| [`@simpill/api.utils`](./utils/api.utils) | Typed API factory: fetch client, handler registry, Zod validation, middleware, retry/timeout | 🆕 New |
| [`@simpill/annotations.utils`](./utils/annotations.utils) | createMetadataStore, getMetadata, setMetadata | 🆕 New |
| [`@simpill/collections.utils`](./utils/collections.utils) | LinkedList, Vector, Queue, Stack, Deque, CircularBuffer, LRU/TTL cache, MultiMap, BiMap, OrderedMap, TypedSet | 🆕 New |
| [`@simpill/request-context.utils`](./utils/request-context.utils) | AsyncLocalStorage request context (requestId, traceId), runWithRequestContext, getRequestContext | 🆕 New |
| [`@simpill/http.utils`](./utils/http.utils) | Fetch with timeout, retry, createHttpClient, isRetryableStatus | 🆕 New |
| [`@simpill/resilience.utils`](./utils/resilience.utils) | Circuit breaker, rate limiter, bulkhead, withJitter | 🆕 New |
| [`@simpill/middleware.utils`](./utils/middleware.utils) | Framework-agnostic middleware types, createCorrelationMiddleware | 🆕 New |
| [`@simpill/socket.utils`](./utils/socket.utils) | Reconnecting WebSocket client with heartbeat | 🆕 New |
| [`@simpill/react.utils`](./utils/react.utils) | React hooks: useLatest, createSafeContext, useStableCallback, useLazyState, useDeferredUpdate | 🆕 New |
| [`@simpill/nextjs.utils`](./utils/nextjs.utils) | Next.js: createSafeAction, route helpers, withRequestContext, withCorrelation (middleware) | 🆕 New |

## Quick Start

Install any package independently:

```bash
npm install @simpill/env.utils
npm install @simpill/logger.utils
npm install @simpill/misc.utils
npm install @simpill/cache.utils
npm install @simpill/async.utils
npm install @simpill/function.utils
npm install @simpill/string.utils
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
├── utils/
│   ├── env.utils/              # @simpill/env.utils
│   ├── logger.utils/           # @simpill/logger.utils
│   ├── object.utils/          # @simpill/object.utils
│   ├── misc.utils/             # @simpill/misc.utils
│   ├── cache.utils/            # @simpill/cache.utils
│   ├── async.utils/            # @simpill/async.utils
│   ├── function.utils/         # @simpill/function.utils
│   ├── string.utils/           # @simpill/string.utils
│   ├── test.utils/             # @simpill/test.utils
│   ├── events.utils/           # @simpill/events.utils
│   ├── data.utils/            # @simpill/data.utils
│   ├── time.utils/            # @simpill/time.utils
│   ├── uuid.utils/            # @simpill/uuid.utils
│   ├── crypto.utils/          # @simpill/crypto.utils
│   ├── file.utils/            # @simpill/file.utils
│   ├── errors.utils/          # @simpill/errors.utils
│   ├── patterns.utils/        # @simpill/patterns.utils
│   ├── factories.utils/       # @simpill/factories.utils
│   ├── adapters.utils/        # @simpill/adapters.utils
│   ├── annotations.utils/     # @simpill/annotations.utils
│   ├── collections.utils/     # @simpill/collections.utils
│   ├── request-context.utils/ # @simpill/request-context.utils
│   ├── http.utils/            # @simpill/http.utils
│   ├── resilience.utils/      # @simpill/resilience.utils
│   ├── middleware.utils/      # @simpill/middleware.utils
│   ├── socket.utils/          # @simpill/socket.utils
│   ├── react.utils/           # @simpill/react.utils
│   └── nextjs.utils/          # @simpill/nextjs.utils
├── AGENTS.md                   # Repository guidelines for AI agents
├── CLAUDE.md                   # Claude-specific instructions
├── CONTRIBUTING.md             # How to create new packages
└── README.md                   # This file
```

## Development

Each package is self-contained with its own dependencies and scripts. Navigate to a package directory to work on it:

```bash
cd utils/env.utils

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint & format
npm run check:fix
```

To **build and test every utils package** from the repo root:

```bash
./scripts/verify-all-utils.sh
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to create and maintain packages.
- [docs/PACKAGE_README_STANDARD.md](./docs/PACKAGE_README_STANDARD.md) — Standard README structure and links for each package.
- [docs/CODEBASE_SCAN_100_TASKS.md](./docs/CODEBASE_SCAN_100_TASKS.md) — Codebase scan findings (architecture, types, docs, performance).

Each package under `utils/*` has its own README with installation, quick start, API reference, and runnable [examples](./utils/env.utils/README.md#examples).

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
