// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Compares values that can survive a Scene document serialization round trip.
 *
 * Options may use object values. Deserialization gives the option and current value separate object
 * identities, so reference equality alone would lose the selected state even though their JSON values match.
 */
export function multiStateValueEquals(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) return true;
    if (Array.isArray(left) && Array.isArray(right)) {
        return left.length === right.length && left.every((value, index) => multiStateValueEquals(value, right[index]));
    }

    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length
        && leftKeys.every((key, index) => key === rightKeys[index] && multiStateValueEquals(left[key], right[key]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
