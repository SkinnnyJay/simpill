import type { AppErrorMeta } from "./app-error";
import { ERROR, UNKNOWN_ERROR } from "./constants";

/** Plain object representation of an error (name, message, optional code, meta, stack, cause). */
export interface SerializedError {
  name: string;
  message: string;
  code?: string;
  meta?: AppErrorMeta;
  stack?: string;
  /** Cause chain when serializeError(..., { includeCause: true }). */
  cause?: SerializedError;
}

const DEFAULT_MAX_CAUSE_DEPTH = 5;

/** Serialize error to plain object (name, message, code, meta; optional stack/cause via options). If error.meta or cause chain contain circular references, JSON.stringify of the result may throw; sanitize meta at the source or use a safe stringify for logging. */
export function serializeError(
  error: unknown,
  options?: { includeStack?: boolean; includeCause?: boolean; maxCauseDepth?: number }
): SerializedError {
  const includeStack = options?.includeStack ?? false;
  const includeCause = options?.includeCause ?? false;
  const maxCauseDepth = options?.maxCauseDepth ?? DEFAULT_MAX_CAUSE_DEPTH;

  function serializeOne(err: unknown, depth: number): SerializedError {
    if (err instanceof Error) {
      const base: SerializedError = {
        name: err.name,
        message: err.message,
      };
      if ("code" in err && typeof (err as { code?: string }).code === "string") {
        base.code = (err as { code: string }).code;
      }
      if ("meta" in err && (err as { meta?: AppErrorMeta }).meta != null) {
        base.meta = (err as { meta: AppErrorMeta }).meta;
      }
      if (includeStack && err.stack) {
        base.stack = err.stack;
      }
      const cause = (err as Error & { cause?: unknown }).cause;
      if (includeCause && depth < maxCauseDepth && cause !== undefined) {
        base.cause = serializeOne(cause, depth + 1);
      }
      return base;
    }
    return {
      name: ERROR,
      message: typeof err === "string" ? err : UNKNOWN_ERROR,
    };
  }

  return serializeOne(error, 0);
}
