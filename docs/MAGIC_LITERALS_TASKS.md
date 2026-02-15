# Magic Literals Audit – Tasks and Changelog

## Phases

### Phase 1: Block new slop (optional, not yet done)

- [ ] Add Biome or ESLint rule to discourage raw throw strings (e.g. no-throw-literals).
- [ ] Add no-magic-numbers with an allowed list (0, 1, -1, etc.) if desired.

### Phase 2: Centralize by domain (done)

- [x] env.utils – already clean; constants in `src/shared/constants.ts`.
- [x] protocols.utils – no throw literals in src; no change needed.
- [x] resilience.utils – `CIRCUIT_BREAKER_ERROR` in shared constants.
- [x] time.utils – timer prefixes, types, and destroyed error in server constants.
- [x] socket.utils – `WS_READY_STATE`, jitter modes, pong, errors in shared constants.
- [x] async.utils – polling, queue, limit, parallel, any-some errors in shared constants.
- [x] api.utils – HTTP error prefix/sep in internal-constants.
- [x] logger.utils – `ERROR_MESSAGES.MULTI_ADAPTER_REQUIRES_ONE` in shared constants.
- [x] cache.utils – shared + server internal-constants for Redis/in-memory/TTL.
- [x] collections.utils – TTL/LRU/circular-buffer errors in shared constants.
- [x] object.utils – maxSize error in shared constants.
- [x] data.utils – config missing key in shared constants.
- [x] function.utils – debounce/throttle and arguments errors in shared constants.
- [x] string.utils – placeholder error in shared constants.
- [x] patterns.utils – strategy-selector, chain-of-responsibility errors in shared constants.
- [x] errors.utils – serialize-error/app-error keys/messages in shared constants where used.
- [x] file.utils – path error in shared constants.
- [x] crypto.utils – randomBytesSecure RangeError in shared constants.
- [x] react.utils – safe-context provider errors in client constants.
- [x] nextjs.utils – audited; uses shared/server/client constants where applicable.
- [x] http.utils – fetch-with-retry error prefix in shared constants.
- [x] test.utils – faker-wrapper error in shared constants.
- [x] misc.utils – assertion default in shared constants.
- [x] token-optimizer.utils – `ERROR_MESSAGES` including `UNSUPPORTED_TELEMETRY_STORAGE_KIND_PREFIX` in shared constants.
- [x] Remaining packages – audited; constants added or already present.

### Phase 3: Replace usage in src (done)

- [x] All inline error literals in `utils/*/src/**` replaced with constants.
- [x] token-optimizer.utils: telemetryFactory now uses `ERROR_MESSAGES.UNSUPPORTED_TELEMETRY_STORAGE_KIND_PREFIX + kind`.

### Phase 4: Lock in (optional, not yet done)

- [ ] CI step or grep check for common literal patterns in `src/` (e.g. `throw new Error(\"` or `` throw new Error(` ``).
- [ ] Tests that assert on error messages use exported constants where appropriate.

---

## Changelog

| Date       | Scope                    | Change                                                                 |
|-----------|---------------------------|-------------------------------------------------------------------------|
| 2025-02-14 | token-optimizer.utils    | Centralized telemetry storage kind error: added `UNSUPPORTED_TELEMETRY_STORAGE_KIND_PREFIX` to shared `ERROR_MESSAGES`; telemetryFactory throws using constant + kind. |
| 2025-02-14 | docs                     | Added MAGIC_LITERALS_REPORT.md and MAGIC_LITERALS_TASKS.md.            |
