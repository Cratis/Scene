// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SubjectReference } from '@cratis/scene.model';
import { GuardEvaluationOptions } from './GuardEvaluationOptions';

const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const numericOperators = new Set(['GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual']);
type Comparison = (left: unknown, right: unknown) => boolean;

function numbers(left: unknown, right: unknown, compare: (first: number, second: number) => boolean): boolean {
    if (typeof left !== 'number' || typeof right !== 'number') return false;
    return compare(left, right);
}

function contains(left: unknown, right: unknown): boolean {
    if (typeof left === 'string') return typeof right === 'string' && left.includes(right);
    return Array.isArray(left) && left.some(value => scalar(value) && value === right);
}

const comparisons: Record<string, Comparison> = {
    Equal: (left, right) => scalar(left) && left === right,
    NotEqual: (left, right) => scalar(left) && typeof left === typeof right && left !== right,
    GreaterThan: (left, right) => numbers(left, right, (first, second) => first > second),
    GreaterThanOrEqual: (left, right) => numbers(left, right, (first, second) => first >= second),
    LessThan: (left, right) => numbers(left, right, (first, second) => first < second),
    LessThanOrEqual: (left, right) => numbers(left, right, (first, second) => first <= second),
    Contains: contains,
    StartsWith: (left, right) => typeof left === 'string' && typeof right === 'string' && left.startsWith(right),
};

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function scalar(value: unknown): value is string | number | boolean | null {
    return value === null || ['string', 'boolean'].includes(typeof value) || (typeof value === 'number' && Number.isFinite(value));
}

function safeSegment(part: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(part) && !forbidden.has(part);
}

function subjectPath(reference: unknown): string[] | undefined {
    if (!record(reference)) return undefined;
    if (typeof reference.subject !== 'string') return undefined;
    if (!reference.subject.startsWith('item.')) return undefined;
    const parts = reference.subject.slice(5).split('.');
    return parts.every(safeSegment) ? parts : undefined;
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

function validEnumeration(value: unknown): boolean {
    if (value === undefined) return true;
    if (!Array.isArray(value) || value.length === 0) return false;
    return value.every(member => typeof member === 'string') && new Set(value).size === value.length;
}

function strictContains(operator: unknown, options?: GuardEvaluationOptions): boolean {
    return operator === 'Contains' && options?.strictOperands === true;
}

function stringOperands(left: unknown, right: unknown): boolean {
    return typeof left === 'string' && typeof right === 'string';
}

function validLiteral(operator: string, right: unknown, options?: GuardEvaluationOptions): boolean {
    if (strictContains(operator, options)) return typeof right === 'string';
    if (!scalar(right)) return false;
    if (numericOperators.has(operator)) return typeof right === 'number';
    return operator !== 'StartsWith' || typeof right === 'string';
}

function validComparison(condition: Record<string, unknown>, options?: GuardEvaluationOptions): boolean {
    if (!subjectPath(condition.left)) return false;
    if (typeof condition.operator !== 'string') return false;
    if (!Object.hasOwn(comparisons, condition.operator)) return false;
    return validEnumeration(condition.enumeration) && validLiteral(condition.operator, condition.right, options);
}

export function canEvaluateGuard(condition: unknown, options?: GuardEvaluationOptions): boolean {
    if (!record(condition)) return false;
    if (condition.kind === 'comparison') return validComparison(condition, options);
    if (condition.kind !== 'logical') return false;
    if (condition.operator !== 'And' && condition.operator !== 'Or') return false;
    return canEvaluateGuard(condition.left, options) && canEvaluateGuard(condition.right, options);
}

function ordinal(value: unknown, length: number): value is number {
    if (typeof value !== 'number' || !Number.isInteger(value)) return false;
    return value >= 0 && value < length;
}

function normalize(value: unknown, enumeration: unknown): unknown {
    if (!Array.isArray(enumeration) || value === null) return value;
    if (ordinal(value, enumeration.length)) return enumeration[value];
    if (typeof value === 'string') return enumeration.find(member => member.toLowerCase() === value.toLowerCase());
    return undefined;
}

function unmatchedOperands(left: unknown, right: unknown): boolean {
    return left === undefined || right === undefined || right === null;
}

function compare(condition: Record<string, unknown>, item: unknown, options?: GuardEvaluationOptions): boolean | undefined {
    const value = resolveSubjectReference(condition.left as SubjectReference, item);
    if (value === undefined) return false;
    if (value === null) return condition.operator === 'Equal' && value === normalize(condition.right, condition.enumeration);
    if (strictContains(condition.operator, options) && !stringOperands(value, condition.right)) return undefined;
    const right = normalize(condition.right, condition.enumeration);
    const left = normalize(value, condition.enumeration);
    if (unmatchedOperands(left, right)) return false;
    return comparisons[condition.operator as string](left, right);
}

function evaluateLogical(condition: Record<string, unknown>, item: unknown, options?: GuardEvaluationOptions): boolean | undefined {
    const left = evaluateGuard(condition.left, item, options);
    const right = evaluateGuard(condition.right, item, options);
    if (left === undefined || right === undefined) return undefined;
    return condition.operator === 'And' ? left && right : left || right;
}

export function evaluateGuard(condition: unknown, item: unknown, options?: GuardEvaluationOptions): boolean | undefined {
    if (!canEvaluateGuard(condition, options) || !record(condition)) return undefined;
    if (condition.kind === 'comparison') return compare(condition, item, options);
    return evaluateLogical(condition, item, options);
}
