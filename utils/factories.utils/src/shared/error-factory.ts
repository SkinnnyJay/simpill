/**
 * Creates a function that returns a new Error (or subclass) with a fixed message/code.
 * Useful for consistent error creation in adapters or services.
 */
export type ErrorConstructor = new (message: string) => Error;

export function errorFactory(
  Ctor: ErrorConstructor,
  defaultMessage: string,
  defaultCode?: string
): (message?: string, code?: string) => Error {
  return (message?: string, code?: string): Error => {
    const err = new Ctor(message ?? defaultMessage);
    if (defaultCode != null || code != null) {
      (err as Error & { code?: string }).code = code ?? defaultCode;
    }
    return err;
  };
}
