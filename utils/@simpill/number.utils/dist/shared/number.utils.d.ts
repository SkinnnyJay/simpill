/**
 * Number helpers: type guards, coercion, clamp, round, range, lerp, sum, avg.
 */
/** Type guard: value is a finite number (excludes NaN, ±Infinity). */
export declare function isFiniteNumber(value: unknown): value is number;
/** Type guard: value is an integer (number and integer). */
export declare function isInteger(value: unknown): value is number;
/** Clamp value between min and max (inclusive). */
export declare function clamp(value: number, min: number, max: number): number;
/** Round value to given decimal places. */
export declare function roundTo(value: number, decimals: number): number;
/** Parse to integer; returns fallback for NaN/invalid. */
export declare function toInt(value: unknown, fallback?: number): number;
/** Parse to float; returns fallback for NaN/invalid. */
export declare function toFloat(value: unknown, fallback?: number): number;
export type IsInRangeOptions = {
    /** If true, min and max are inclusive (default true). */
    inclusive?: boolean;
};
/** True if value is in [min, max] (or (min, max) when inclusive: false). */
export declare function isInRange(value: number, min: number, max: number, options?: IsInRangeOptions): boolean;
/** Random integer in [min, max] inclusive. */
export declare function randomInt(min: number, max: number): number;
/** Linear interpolation: (1-t)*a + t*b. */
export declare function lerp(a: number, b: number, t: number): number;
/** Sum of numbers. */
export declare function sum(values: number[]): number;
/** Average of numbers; 0 for empty array. */
export declare function avg(values: number[]): number;
//# sourceMappingURL=number.utils.d.ts.map