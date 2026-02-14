/** Chainable builder for an object T with set, merge, and build. */
export type Builder<T> = {
  set: <K extends keyof T>(key: K, value: T[K]) => Builder<T>;
  merge: (partial: Partial<T>) => Builder<T>;
  build: () => T;
};

/**
 * Builder pattern: compose an object via chainable setters.
 * @param initial - Initial state (shallow-copied)
 * @returns Builder with set, merge, build
 */
export function createBuilder<T extends Record<string, unknown>>(initial: T): Builder<T> {
  let state: T = { ...initial };

  return {
    set: (key, value) => {
      state = { ...state, [key]: value };
      return createBuilder(state);
    },
    merge: (partial) => {
      state = { ...state, ...partial };
      return createBuilder(state);
    },
    build: () => ({ ...state }),
  };
}
