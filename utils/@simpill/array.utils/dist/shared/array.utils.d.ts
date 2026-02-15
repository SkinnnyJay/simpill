/**
 * Array helpers: guards, unique, chunk, compact, flattenOnce, groupBy, sortBy,
 * partition, ensureArray, first, last.
 */
/** Type guard: value is a non-empty array. */
export declare function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]];
/** Type guard: value is an array (possibly empty). */
export declare function isArrayLike<T>(value: unknown): value is T[];
/** Dedupe by reference; preserves first occurrence. */
export declare function unique<T>(array: T[]): T[];
/** Dedupe by key; preserves first occurrence per key. */
export declare function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[];
/** Split array into chunks of size. */
export declare function chunk<T>(array: T[], size: number): T[][];
/** Remove null and undefined from array. */
export declare function compact<T>(array: (T | null | undefined)[]): T[];
/** Flatten one level. */
export declare function flattenOnce<T>(array: ReadonlyArray<T | T[]>): T[];
/** Group by key; returns Map<K, T[]>. */
export declare function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]>;
export type SortOrder = "asc" | "desc";
/** Sort by key; returns new array. */
export declare function sortBy<T, K>(array: T[], keyFn: (item: T) => K, order?: SortOrder): T[];
/** Split array into [matches, rest] by predicate. */
export declare function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]];
/** Ensure value is an array; wrap single item in array. */
export declare function ensureArray<T>(value: T | T[] | null | undefined): T[];
/** First element or undefined if empty. */
export declare function first<T>(array: T[]): T | undefined;
/** Last element or undefined if empty. */
export declare function last<T>(array: T[]): T | undefined;
/** First n elements. */
export declare function take<T>(array: T[], n: number): T[];
/** Skip first n elements. */
export declare function drop<T>(array: T[], n: number): T[];
/** Last n elements. */
export declare function takeRight<T>(array: T[], n: number): T[];
/** Skip last n elements. */
export declare function dropRight<T>(array: T[], n: number): T[];
/** Zip two arrays into pairs; length = min(a.length, b.length). */
export declare function zip<A, B>(a: A[], b: B[]): [A, B][];
/** Unzip pairs into [as, bs]. */
export declare function unzip<A, B>(pairs: [A, B][]): [A[], B[]];
/** Build map key -> first occurrence; use when keys are unique. */
export declare function keyBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T>;
/** Count occurrences by key. */
export declare function countBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, number>;
/** Elements in both arrays (Set equality). */
export declare function intersection<T>(a: T[], b: T[]): T[];
/** Elements in a not in b (Set equality). */
export declare function difference<T>(a: T[], b: T[]): T[];
/** All unique elements from both arrays. */
export declare function union<T>(a: T[], b: T[]): T[];
/** One random element or undefined if empty. */
export declare function sample<T>(array: T[]): T | undefined;
/** Fisher–Yates shuffle; returns new array. */
export declare function shuffle<T>(array: T[]): T[];
//# sourceMappingURL=array.utils.d.ts.map