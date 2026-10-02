// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Reads a value at a dotted path in a plain object - `a.b.c` reads `bag.a.b.c` - or `undefined` when any step is
 * missing.
 */
export function getValueAtPath(bag: Record<string, unknown>, path: string): unknown {
    let current: unknown = bag;
    for (const key of path.split('.')) {
        if (current === null || typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[key];
    }

    return current;
}

/**
 * Whether a dotted path holds a value.
 */
export function hasValueAtPath(bag: Record<string, unknown>, path: string): boolean {
    return getValueAtPath(bag, path) !== undefined;
}

/**
 * Sets a value at a dotted path, creating intermediate objects. Mutates `bag`: callers hold a copy.
 */
export function setValueAtPath(bag: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = bag;
    for (const key of keys.slice(0, -1)) {
        const next = current[key];
        if (next === null || typeof next !== 'object' || Array.isArray(next)) {
            current[key] = {};
        }

        current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
}

/**
 * Removes the value at a dotted path, leaving intermediate objects in place. Mutates `bag`.
 */
export function removeValueAtPath(bag: Record<string, unknown>, path: string): void {
    const keys = path.split('.');
    let current: unknown = bag;
    for (const key of keys.slice(0, -1)) {
        if (current === null || typeof current !== 'object') return;
        current = (current as Record<string, unknown>)[key];
    }

    if (current !== null && typeof current === 'object') {
        delete (current as Record<string, unknown>)[keys[keys.length - 1]];
    }
}

/**
 * A copy of plain JSON-shaped data that shares nothing with the original.
 */
export function cloneData<T>(value: T): T {
    return structuredClone(value);
}

/**
 * Whether two plain values are structurally equal.
 */
export function dataEquals(left: unknown, right: unknown): boolean {
    if (left === right) return true;
    if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return false;
    if (Array.isArray(left) !== Array.isArray(right)) return false;

    const leftKeys = Object.keys(left as object);
    const rightKeys = Object.keys(right as object);
    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every(key =>
        Object.prototype.hasOwnProperty.call(right, key)
        && dataEquals((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]));
}
