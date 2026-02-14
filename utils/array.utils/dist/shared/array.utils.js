"use strict";
/**
 * Array helpers: guards, unique, chunk, compact, flattenOnce, groupBy, sortBy,
 * partition, ensureArray, first, last.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonEmptyArray = isNonEmptyArray;
exports.isArrayLike = isArrayLike;
exports.unique = unique;
exports.uniqueBy = uniqueBy;
exports.chunk = chunk;
exports.compact = compact;
exports.flattenOnce = flattenOnce;
exports.groupBy = groupBy;
exports.sortBy = sortBy;
exports.partition = partition;
exports.ensureArray = ensureArray;
exports.first = first;
exports.last = last;
exports.take = take;
exports.drop = drop;
exports.takeRight = takeRight;
exports.dropRight = dropRight;
exports.zip = zip;
exports.unzip = unzip;
exports.keyBy = keyBy;
exports.countBy = countBy;
exports.intersection = intersection;
exports.difference = difference;
exports.union = union;
exports.sample = sample;
exports.shuffle = shuffle;
/** Type guard: value is a non-empty array. */
function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}
/** Type guard: value is an array (possibly empty). */
function isArrayLike(value) {
    return Array.isArray(value);
}
/** Dedupe by reference; preserves first occurrence. */
function unique(array) {
    return [...new Set(array)];
}
/** Dedupe by key; preserves first occurrence per key. */
function uniqueBy(array, keyFn) {
    const seen = new Set();
    const result = [];
    for (const item of array) {
        const key = keyFn(item);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
    }
    return result;
}
/** Split array into chunks of size. */
function chunk(array, size) {
    if (size <= 0)
        return [];
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
/** Remove null and undefined from array. */
function compact(array) {
    return array.filter((x) => x !== null && x !== undefined);
}
/** Flatten one level. */
function flattenOnce(array) {
    const result = [];
    for (const item of array) {
        if (Array.isArray(item))
            result.push(...item);
        else
            result.push(item);
    }
    return result;
}
/** Group by key; returns Map<K, T[]>. */
function groupBy(array, keyFn) {
    const map = new Map();
    for (const item of array) {
        const key = keyFn(item);
        const list = map.get(key);
        if (list)
            list.push(item);
        else
            map.set(key, [item]);
    }
    return map;
}
/** Sort by key; returns new array. */
function sortBy(array, keyFn, order = "asc") {
    const cmp = order === "desc"
        ? (a, b) => (a < b ? 1 : a > b ? -1 : 0)
        : (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    return [...array].sort((x, y) => cmp(keyFn(x), keyFn(y)));
}
/** Split array into [matches, rest] by predicate. */
function partition(array, predicate) {
    const left = [];
    const right = [];
    for (const item of array) {
        if (predicate(item))
            left.push(item);
        else
            right.push(item);
    }
    return [left, right];
}
/** Ensure value is an array; wrap single item in array. */
function ensureArray(value) {
    if (value === null || value === undefined)
        return [];
    return Array.isArray(value) ? value : [value];
}
/** First element or undefined if empty. */
function first(array) {
    return array[0];
}
/** Last element or undefined if empty. */
function last(array) {
    return array[array.length - 1];
}
/** First n elements. */
function take(array, n) {
    if (n <= 0)
        return [];
    return array.slice(0, n);
}
/** Skip first n elements. */
function drop(array, n) {
    if (n <= 0)
        return array.slice();
    return array.slice(n);
}
/** Last n elements. */
function takeRight(array, n) {
    if (n <= 0)
        return [];
    return array.slice(-n);
}
/** Skip last n elements. */
function dropRight(array, n) {
    if (n <= 0)
        return array.slice();
    return array.slice(0, -n);
}
/** Zip two arrays into pairs; length = min(a.length, b.length). */
function zip(a, b) {
    const len = Math.min(a.length, b.length);
    const result = [];
    for (let i = 0; i < len; i++)
        result.push([a[i], b[i]]);
    return result;
}
/** Unzip pairs into [as, bs]. */
function unzip(pairs) {
    const as = [];
    const bs = [];
    for (const [x, y] of pairs) {
        as.push(x);
        bs.push(y);
    }
    return [as, bs];
}
/** Build map key -> first occurrence; use when keys are unique. */
function keyBy(array, keyFn) {
    const map = new Map();
    for (const item of array) {
        const key = keyFn(item);
        if (!map.has(key))
            map.set(key, item);
    }
    return map;
}
/** Count occurrences by key. */
function countBy(array, keyFn) {
    const map = new Map();
    for (const item of array) {
        const key = keyFn(item);
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
}
/** Elements in both arrays (Set equality). */
function intersection(a, b) {
    const set = new Set(b);
    return a.filter((x) => set.has(x));
}
/** Elements in a not in b (Set equality). */
function difference(a, b) {
    const set = new Set(b);
    return a.filter((x) => !set.has(x));
}
/** All unique elements from both arrays. */
function union(a, b) {
    return unique([...a, ...b]);
}
/** One random element or undefined if empty. */
function sample(array) {
    if (array.length === 0)
        return undefined;
    return array[Math.floor(Math.random() * array.length)];
}
/** Fisher–Yates shuffle; returns new array. */
function shuffle(array) {
    const out = array.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
//# sourceMappingURL=array.utils.js.map