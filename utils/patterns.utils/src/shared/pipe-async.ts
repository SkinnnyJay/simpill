/**
 * Compose async functions into a pipeline; each receives the previous result. Short-circuits on first rejection.
 * @param fns - One or more (x) => Promise<y>; first gets input, rest get prior result
 * @returns (x) => Promise of final result
 */
export function pipeAsync<T0, T1>(f0: (x: T0) => Promise<T1>): (x: T0) => Promise<T1>;
export function pipeAsync<T0, T1, T2>(
  f0: (x: T0) => Promise<T1>,
  f1: (x: T1) => Promise<T2>
): (x: T0) => Promise<T2>;
export function pipeAsync<T0, T1, T2, T3>(
  f0: (x: T0) => Promise<T1>,
  f1: (x: T1) => Promise<T2>,
  f2: (x: T2) => Promise<T3>
): (x: T0) => Promise<T3>;
export function pipeAsync<T>(...fns: Array<(x: T) => Promise<T>>): (x: T) => Promise<T>;
export function pipeAsync(
  ...fns: Array<(x: unknown) => Promise<unknown>>
): (x: unknown) => Promise<unknown> {
  return (x: unknown) => {
    let p: Promise<unknown> = Promise.resolve(x);
    for (const fn of fns) {
      p = p.then(fn);
    }
    return p;
  };
}
