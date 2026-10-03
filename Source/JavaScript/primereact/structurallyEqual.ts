// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Compares values that can survive a Scene document serialization round trip.
 *
 * Authored data (chart datasets, option values, current values) arrives as plain JSON. Every edit to a
 * Scene document clones the whole document, so the same data gets a new object identity with no change in
 * content; reference equality would treat each unrelated edit as a change. Primitives compare with
 * `Object.is`, so `0` and `-0`, or `NaN` and `NaN`, are told apart exactly as `Object.is` does.
 */
export function structurallyEqual(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) return true;
    if (Array.isArray(left) || Array.isArray(right)) {
        return Array.isArray(left) && Array.isArray(right)
            && left.length === right.length
            && left.every((value, index) => structurallyEqual(value, right[index]));
    }

    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length
        && leftKeys.every((key, index) => key === rightKeys[index] && structurallyEqual(left[key], right[key]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}
