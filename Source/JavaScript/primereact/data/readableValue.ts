// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Nested deeper than this is shown as an ellipsis, so a cyclic or enormous value cannot flood the page. */
const maximumDepth = 3;

/**
 * Writes any authored value as text a person can read.
 *
 * Scalars are shown as they are. An array is its readable entries joined by commas, and an object is
 * `name: value` pairs joined by semicolons - never `[object Object]`, and never a raw JSON document. `null`
 * and `undefined` are empty.
 *
 * @param value The authored value.
 * @param depth How deep the value is nested already; callers leave it out.
 */
export function readableValue(value: unknown, depth = 0): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    if (depth >= maximumDepth) return '…';
    if (Array.isArray(value)) return value.map(entry => readableValue(entry, depth + 1)).filter(text => text !== '').join(', ');
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([name, entry]) => [name, readableValue(entry, depth + 1)])
            .filter(([, text]) => text !== '')
            .map(([name, text]) => `${name}: ${text}`)
            .join('; ');
    }

    return '';
}
