/** Wraps a function with the same signature. */
export type Decorator<TArgs extends unknown[], TResult> = (
  fn: (...args: TArgs) => TResult
) => (...args: TArgs) => TResult;

/**
 * Decorator pattern: compose function decorators in order (left to right).
 * @param fn - Base function
 * @param decorators - Applied in order; each receives the current function
 * @returns Composed function
 */
export function decorate<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  ...decorators: Array<Decorator<TArgs, TResult>>
): (...args: TArgs) => TResult {
  return decorators.reduce((current, decorator) => decorator(current), fn);
}
