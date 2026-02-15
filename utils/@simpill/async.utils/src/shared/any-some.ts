export type AnyResult<T> = {
  value: T;
  index: number;
};

export type SomeResult<T> = {
  values: T[];
  fulfilledCount: number;
  rejectedCount: number;
};

const createAggregateError = (errors: unknown[], message: string): Error => {
  const error = new Error(message);
  error.name = "AggregateError";
  (error as Error & { errors?: unknown[] }).errors = errors;
  return error;
};

/**
 * Resolve with the first fulfilled promise. Rejects if all reject.
 */
export async function anyFulfilled<T>(promises: Array<Promise<T>>): Promise<AnyResult<T>> {
  if (promises.length === 0) {
    throw new Error("anyFulfilled requires at least one promise.");
  }

  return new Promise<AnyResult<T>>((resolve, reject) => {
    let rejected = 0;
    const errors: unknown[] = [];

    promises.forEach((promise, index) => {
      promise
        .then((value) => resolve({ value, index }))
        .catch((error) => {
          rejected += 1;
          errors[index] = error;
          if (rejected === promises.length) {
            reject(createAggregateError(errors, "All promises rejected."));
          }
        });
    });
  });
}

/**
 * Resolve when `count` promises fulfill. Rejects if impossible.
 */
export async function someFulfilled<T>(
  promises: Array<Promise<T>>,
  count: number,
): Promise<SomeResult<T>> {
  if (count < 1) {
    throw new Error("count must be >= 1.");
  }
  if (count > promises.length) {
    throw new Error("count must be <= number of promises.");
  }

  return new Promise<SomeResult<T>>((resolve, reject) => {
    const values: T[] = [];
    let fulfilled = 0;
    let rejected = 0;
    const errors: unknown[] = [];

    const pendingCount = (): number => promises.length - (fulfilled + rejected);
    const maybeResolveOrReject = (): void => {
      if (fulfilled >= count) {
        resolve({ values, fulfilledCount: fulfilled, rejectedCount: rejected });
        return;
      }
      if (fulfilled + pendingCount() < count) {
        reject(createAggregateError(errors, "Not enough promises fulfilled."));
      }
    };

    promises.forEach((promise, index) => {
      promise
        .then((value) => {
          values.push(value);
          fulfilled += 1;
          maybeResolveOrReject();
        })
        .catch((error) => {
          errors[index] = error;
          rejected += 1;
          maybeResolveOrReject();
        });
    });
  });
}
