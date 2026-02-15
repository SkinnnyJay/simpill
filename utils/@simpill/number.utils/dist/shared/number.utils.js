"use strict";
/**
 * Number helpers: type guards, coercion, clamp, round, range, lerp, sum, avg.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFiniteNumber = isFiniteNumber;
exports.isInteger = isInteger;
exports.clamp = clamp;
exports.roundTo = roundTo;
exports.toInt = toInt;
exports.toFloat = toFloat;
exports.isInRange = isInRange;
exports.randomInt = randomInt;
exports.lerp = lerp;
exports.sum = sum;
exports.avg = avg;
/** Type guard: value is a finite number (excludes NaN, ±Infinity). */
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
/** Type guard: value is an integer (number and integer). */
function isInteger(value) {
    return typeof value === "number" && Number.isInteger(value);
}
/** Clamp value between min and max (inclusive). */
function clamp(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
/** Round value to given decimal places. */
function roundTo(value, decimals) {
    const factor = 10 ** Math.max(0, Math.floor(decimals));
    return Math.round(value * factor) / factor;
}
/** Parse to integer; returns fallback for NaN/invalid. */
function toInt(value, fallback) {
    const n = typeof value === "number" ? value : Number(value);
    const i = Number.isInteger(n) ? n : Math.floor(n);
    if (!Number.isFinite(i))
        return fallback ?? 0;
    return i;
}
/** Parse to float; returns fallback for NaN/invalid. */
function toFloat(value, fallback) {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n))
        return fallback ?? 0;
    return n;
}
/** True if value is in [min, max] (or (min, max) when inclusive: false). */
function isInRange(value, min, max, options = {}) {
    const inclusive = options.inclusive ?? true;
    if (inclusive)
        return value >= min && value <= max;
    return value > min && value < max;
}
/** Random integer in [min, max] inclusive. */
function randomInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}
/** Linear interpolation: (1-t)*a + t*b. */
function lerp(a, b, t) {
    return a + (b - a) * t;
}
/** Sum of numbers. */
function sum(values) {
    return values.reduce((acc, n) => acc + n, 0);
}
/** Average of numbers; 0 for empty array. */
function avg(values) {
    if (values.length === 0)
        return 0;
    return sum(values) / values.length;
}
//# sourceMappingURL=number.utils.js.map