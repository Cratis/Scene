// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
export const hasOnlyKeys = (value: Record<string, unknown>, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));

const sameArray = (left: unknown[], right: unknown[]): boolean => left.length === right.length && left.every((value, index) => sameValue(value, right[index]));
const sameRecord = (left: Record<string, unknown>, right: Record<string, unknown>): boolean => {
    const names = Object.keys(left);
    return names.length === Object.keys(right).length && names.every(key => Object.prototype.hasOwnProperty.call(right, key) && sameValue(left[key], right[key]));
};

export function sameValue(left: unknown, right: unknown): boolean {
    if (left === right) return true;
    if (Array.isArray(left) && Array.isArray(right)) return sameArray(left, right);
    return isRecord(left) && isRecord(right) && sameRecord(left, right);
}

const unsafeKeys = ['__proto__', 'constructor', 'prototype'];

function checkLeaf(value: unknown, depth: number): void {
    if (depth > 40) throw new Error('The proposal is nested too deeply.');
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Numbers must be finite.');
}

export function checkTree(value: unknown, depth = 0): void {
    checkLeaf(value, depth);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
        if (unsafeKeys.includes(key)) throw new Error('Unsafe property keys are not supported.');
        checkTree(child, depth + 1);
    }
}

export function collectIdentities(value: unknown, found = new Set<string>()): Set<string> {
    if (!value || typeof value !== 'object') return found;
    if (isRecord(value) && typeof value.id === 'string') found.add(value.id);
    Object.values(value).forEach(child => collectIdentities(child, found));
    return found;
}
