import { VALUE_0 } from "./constants";

/**
 * Creates a factory function that produces instances of T with optional partial overrides.
 * Defaults are merged (shallow) with overrides per call.
 */
export function createFactory<T extends object>(defaults: T): (overrides?: Partial<T>) => T {
  return (overrides?: Partial<T>): T => {
    if (overrides == null || Object.keys(overrides).length === VALUE_0) {
      return { ...defaults };
    }
    return { ...defaults, ...overrides };
  };
}
