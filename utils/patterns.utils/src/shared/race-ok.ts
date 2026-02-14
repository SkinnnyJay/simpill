import { AppError, ERROR_CODES } from "@simpill/errors.utils";
import { err, ok, type Result } from "./result";

/**
 * Options for customizing error when all results in raceOk fail.
 * @typeParam E - Error type collected from failed results
 */
export interface RaceOkOptions<E> {
  /** Custom mapper from collected errors to AppError; defaults to AppError with errorMessage/errorCode */
  mapError?: (errors: E[]) => AppError;
  /** Message used when building default AppError */
  errorMessage?: string;
  /** Code used when building default AppError */
  errorCode?: string;
}

const defaultMapError = <E>(
  errors: E[],
  options?: Pick<RaceOkOptions<E>, "errorMessage" | "errorCode">
): AppError => {
  const message = options?.errorMessage ?? "No successful result";
  const code = options?.errorCode ?? ERROR_CODES.INTERNAL;
  const cause = errors.length === 1 ? errors[0] : errors;
  return new AppError(message, { code, cause, meta: { errorCount: errors.length } });
};

/**
 * Resolve with the first Ok result from the array of Result promises; if all fail, returns Err.
 * @param results - Non-empty array of promises that resolve to Result<T, E>
 * @param options - Optional mapError, errorMessage, errorCode for the aggregated error
 * @returns Promise of Result<T, AppError>: Ok(first success) or Err(mapped from all failures)
 * @throws Never throws; empty array yields Err(AppError) with BAD_REQUEST
 */
export async function raceOk<T, E>(
  results: Array<Promise<Result<T, E>>>,
  options: RaceOkOptions<E> = {}
): Promise<Result<T, AppError>> {
  if (results.length === 0) {
    return err(
      new AppError("raceOk requires at least one result", { code: ERROR_CODES.BAD_REQUEST })
    );
  }

  return new Promise<Result<T, AppError>>((resolve) => {
    let settled = 0;
    let done = false;
    const errors: E[] = [];
    const mapError = options.mapError ?? ((errs: E[]) => defaultMapError(errs, options));

    results.forEach((promise) => {
      promise
        .then((result) => {
          if (done) return;
          if (result.ok) {
            done = true;
            resolve(ok(result.value));
            return;
          }
          errors.push(result.error);
          settled += 1;
          if (settled === results.length && !done) {
            done = true;
            resolve(err(mapError(errors)));
          }
        })
        .catch((error) => {
          if (done) return;
          errors.push(error as E);
          settled += 1;
          if (settled === results.length && !done) {
            done = true;
            resolve(err(mapError(errors)));
          }
        });
    });
  });
}
