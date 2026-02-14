/** Function that converts a source value to a target value. */
export type Adapter<TSource, TTarget> = (source: TSource) => TTarget;

/**
 * Adapter pattern: wrap a conversion into a typed adapter function.
 * @param adapter - Function from TSource to TTarget
 * @returns The same adapter (typed as Adapter)
 */
export function createAdapter<TSource, TTarget>(
  adapter: Adapter<TSource, TTarget>
): Adapter<TSource, TTarget> {
  return adapter;
}

/**
 * Apply an adapter to a source value.
 * @param source - Input value
 * @param adapter - Conversion function
 * @returns adapter(source)
 */
export function adapt<TSource, TTarget>(
  source: TSource,
  adapter: Adapter<TSource, TTarget>
): TTarget {
  return adapter(source);
}
