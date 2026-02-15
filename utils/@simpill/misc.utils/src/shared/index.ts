/**
 * Re-exports from canonical packages. Implementation lives in:
 * - @simpill/function.utils (debounce, throttle, once)
 * - @simpill/async.utils (raceWithTimeout)
 * - @simpill/cache.utils (memoize)
 * - @simpill/object.utils (singleton)
 * - @simpill/uuid.utils (UUID helpers)
 * - @simpill/enum.utils (enum helpers)
 * Local: primitive-helpers (toBoolean, coalesce, assert, safe JSON).
 */
export {
  assert,
  coalesce,
  identity,
  isBoolean,
  parseJsonSafe,
  toBoolean,
  type ToBooleanOptions,
  toJsonSafe,
  toggle,
} from "./primitive-helpers";
export {
  type CancellableFunction,
  debounce,
  type ThrottleOptions,
  throttle,
  once,
} from "@simpill/function.utils";
export { raceWithTimeout } from "@simpill/async.utils";
export { type MemoizeCache, memoize } from "@simpill/cache.utils";
export {
  createSingleton,
  resetAllSingletons,
  resetSingleton,
} from "@simpill/object.utils";
export {
  compareUUIDs,
  generateUUID,
  isUUID,
  validateUUID,
} from "@simpill/uuid.utils";
export {
  EnumHelper,
  getEnumValue,
  isValidEnumValue,
} from "@simpill/enum.utils";
