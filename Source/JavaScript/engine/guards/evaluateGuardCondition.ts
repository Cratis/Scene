// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SubjectReference } from '@cratis/scene.model';

const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const operators = new Set(['Equal', 'NotEqual', 'GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual', 'Contains', 'StartsWith']);
const numericOperators = new Set(['GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual']);

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function scalar(value: unknown): value is string | number | boolean | null {
    return value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
}

function subjectPath(reference: unknown): string[] | undefined {
    if (!record(reference) || typeof reference.subject !== 'string' || !reference.subject.startsWith('item.')) return undefined;
    const parts = reference.subject.slice(5).split('.');
    return parts.every(part => /^[A-Za-z_][A-Za-z0-9_]*$/.test(part) && !forbidden.has(part)) ? parts : undefined;
}

export function resolveSubjectReference(reference: SubjectReference, item: unknown): unknown {
    const parts = subjectPath(reference);
    if (!parts) return undefined;
    let value = item;
    for (const part of parts) {
        if (!record(value) || !Object.hasOwn(value, part)) return undefined;
        value = value[part];
    }
    return value;
}

export function canEvaluateGuard(condition: unknown): boolean {
    if (!record(condition)) return false;
    if (condition.kind === 'logical') {
        return (condition.operator === 'And' || condition.operator === 'Or') && canEvaluateGuard(condition.left) && canEvaluateGuard(condition.right);
    }
    if (condition.kind !== 'comparison' || !subjectPath(condition.left) || typeof condition.operator !== 'string' || !operators.has(condition.operator) || !scalar(condition.right)) return false;
    const enumeration = condition.enumeration;
    if (enumeration !== undefined && (!Array.isArray(enumeration) || enumeration.length === 0 || !enumeration.every(value => typeof value === 'string') || new Set(enumeration).size !== enumeration.length)) return false;
    if (numericOperators.has(condition.operator) && typeof condition.right !== 'number') return false;
    if (condition.operator === 'StartsWith' && typeof condition.right !== 'string') return false;
    return true;
}

function normalize(value: unknown, enumeration: unknown): unknown {
    if (!Array.isArray(enumeration) || value === null) return value;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < enumeration.length) return enumeration[value];
    if (typeof value === 'string') return enumeration.find(member => member.toLowerCase() === value.toLowerCase());
    return undefined;
}

function compare(condition: Record<string, unknown>, item: unknown): boolean {
    const left = normalize(resolveSubjectReference(condition.left as SubjectReference, item), condition.enumeration);
    const right = normalize(condition.right, condition.enumeration);
    if (left === undefined || right === undefined) return false;
    if (left === null || right === null) return condition.operator === 'Equal' && left === null && right === null;
    switch (condition.operator) {
        case 'Equal': return scalar(left) && left === right;
        case 'NotEqual': return scalar(left) && typeof left === typeof right && left !== right;
        case 'GreaterThan': return typeof left === 'number' && typeof right === 'number' && left > right;
        case 'GreaterThanOrEqual': return typeof left === 'number' && typeof right === 'number' && left >= right;
        case 'LessThan': return typeof left === 'number' && typeof right === 'number' && left < right;
        case 'LessThanOrEqual': return typeof left === 'number' && typeof right === 'number' && left <= right;
        case 'Contains': return typeof left === 'string' ? typeof right === 'string' && left.includes(right) : Array.isArray(left) && left.some(value => scalar(value) && value === right);
        case 'StartsWith': return typeof left === 'string' && left.startsWith(right as string);
        default: return false;
    }
}

export function evaluateGuard(condition: unknown, item: unknown): boolean | undefined {
    if (!canEvaluateGuard(condition) || !record(condition)) return undefined;
    if (condition.kind === 'comparison') return compare(condition, item);
    const left = evaluateGuard(condition.left, item) === true;
    const right = evaluateGuard(condition.right, item) === true;
    return condition.operator === 'And' ? left && right : left || right;
}
