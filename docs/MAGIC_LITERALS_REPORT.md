# Magic Literals Audit Report

## Scope

- **In scope:** All files under `utils/<package>/src/**/*.ts` and `*.tsx`.
- **Out of scope:** `scripts/`, `__tests__/`, `examples/`, and any file outside `src/`.

Approx. 40 packages under `utils/*.utils/` with `src/client`, `src/server`, and/or `src/shared`. Total ~320+ source files.

## Summary

A full literal audit was performed across all utils packages. Error messages, magic numbers, and status/type strings were inventoried and centralized into per-package constants (e.g. `src/shared/constants.ts` or `internal-constants.ts`). The vast majority of packages already used constants; one remaining inline template literal was fixed in `token-optimizer.utils` (telemetryFactory).

## Ratings

| Dimension         | Rating | Notes                                                                 |
|------------------|--------|-----------------------------------------------------------------------|
| Literal Hygiene  | High   | Error throws use constants; numeric/status literals centralized.      |
| Type Safety      | High   | Constants are `as const` where appropriate; types inferred.           |
| DRY              | High   | Single source of truth per package for messages and limits.          |
| Enforcement      | Medium | No lint rule yet; rely on code review and this audit.                 |

## Findings (by category)

### 1. Error / user-facing strings

All identified error literals are now centralized:

- **api.utils:** `ERROR_HTTP_RESPONSE_PREFIX`, `ERROR_HTTP_RESPONSE_SEP` in `internal-constants.ts`; used in client-builder.
- **async.utils:** `ERROR_POLLING_*`, `ERROR_CONCURRENCY_*`, `ERROR_*_FULFILLED_*`, etc. in `shared/constants.ts`.
- **cache.utils:** `ERROR_MAX_SIZE_*`, `ERROR_TTL_MS_*` in shared constants; Redis messages in `server/internal-constants.ts`.
- **collections.utils:** `ERROR_TTL_CACHE_TTL_MS`, `ERROR_LRU_CACHE_MAX_SIZE`, `ERROR_CIRCULAR_BUFFER_CAPACITY` in shared constants.
- **data.utils:** `ERROR_CONFIG_MISSING_KEY_PREFIX` in shared constants.
- **file.utils:** `ERROR_PATH_RESOLVES_OUTSIDE_ROOT_PREFIX` in shared constants.
- **function.utils:** `ERROR_WAIT_MUST_BE_*`, `ERROR_ARGUMENT_*` in shared constants.
- **logger.utils:** `ERROR_MESSAGES` (including `MULTI_ADAPTER_REQUIRES_ONE`) in shared constants.
- **object.utils:** `ERROR_MAX_SIZE_MUST_BE_GREATER_THAN_ZERO` in shared constants.
- **patterns.utils:** `ERROR_CHAIN_NO_HANDLERS`, `ERROR_STRATEGY_UNKNOWN_PREFIX` in shared constants.
- **resilience.utils:** `CIRCUIT_BREAKER_ERROR.OPEN`, `CIRCUIT_BREAKER_ERROR.HALF_OPEN_MAX_CALLS` in shared constants.
- **socket.utils:** `ERROR_WS_NOT_AVAILABLE`, `ERROR_WS_GENERIC` in shared constants.
- **string.utils:** `ERROR_PLACEHOLDER_MISSING_*` in shared constants.
- **test.utils:** `ERROR_FAKER_PICK_EMPTY` in shared constants.
- **time.utils:** `TIMER_FACTORY_DESTROYED_ERROR` in server constants.
- **token-optimizer.utils:** `ERROR_MESSAGES` (strategies + `UNSUPPORTED_COMPRESSION_TYPE_PREFIX` + `UNSUPPORTED_TELEMETRY_STORAGE_KIND_PREFIX`) in shared constants; telemetryFactory uses prefix + kind.
- **crypto.utils:** `ERROR_RANDOM_BYTES_LENGTH` in shared constants.
- **http.utils:** `ERROR_RETRYABLE_STATUS_PREFIX` in shared constants.
- **misc.utils:** `ASSERTION_FAILED_DEFAULT` in shared constants.
- **react.utils:** `ERROR_USE_CTX_OUTSIDE_*`, `ERROR_USE_SAFE_CONTEXT_OUTSIDE_PROVIDER` in client constants.

### 2. Magic numbers / limits

Centralized as `VALUE_*`, `TIMEOUT_MS_*`, or domain names (e.g. `CIRCUIT_BREAKER_DEFAULT_*`, `POLLING_DEFAULT_BACKOFF_FACTOR` where used) in respective packages. socket.utils uses `WS_READY_STATE`, time.utils uses `TIMER_ID_PREFIX_*` and `TIMER_TYPE`.

### 3. Switch/case and status strings

token-optimizer markdown strategy and others use string literals that align with schema/types; where shared, constants exist (e.g. `LOG_LEVEL`, `JITTER_MODE_*`, `WS_RECONNECT_STATUS`).

### 4. Config / defaults

Defaults live in constants; optional env-driven overrides (e.g. logger.utils `env.config.ts`) remain where the repo already expects runtime config.

## Recommendations

1. **Per-package:** Keep using `src/shared/constants.ts` (or `internal-constants.ts` for non-public) for new error messages and limits.
2. **New code:** Prefer constants for any throw message or magic number; add to existing constant modules.
3. **Phase 4 (optional):** Add a lint or CI step to discourage new raw throw strings (e.g. no-throw-literals) and magic numbers with an allowed list.

## Where constants live

- **Per-package:** `src/shared/constants.ts` or `src/server/constants.ts` / `src/client/constants.ts` when runtime-specific. Internal-only: `internal-constants.ts`.
- **env.utils:** Use for app-facing config (timeouts, log level) only where runtime overrides are intended; package defaults stay in constants.
