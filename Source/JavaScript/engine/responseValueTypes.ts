// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ResponseValueType } from './ResponseValidationContracts';

function memberType(type: ResponseValueType, segment: string): ResponseValueType | undefined {
    if (type.kind !== 'object') return undefined;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(segment)) return undefined;
    if (['constructor', 'prototype', '__proto__'].includes(segment)) return undefined;
    return Object.hasOwn(type.properties, segment) ? type.properties[segment] : undefined;
}

function nullableProjection(parent: ResponseValueType, property: ResponseValueType): ResponseValueType {
    return { ...property, nullable: parent.nullable || property.nullable };
}

function rootType(type: ResponseValueType): ResponseValueType | undefined {
    return type.kind === 'array' ? undefined : type;
}

export function projectResponseType(type: ResponseValueType, path: string): ResponseValueType | undefined {
    if (!path) return rootType(type);
    let selected = type;
    for (const segment of path.split('.')) {
        const property = memberType(selected, segment);
        if (!property) return undefined;
        selected = nullableProjection(selected, property);
    }
    return selected;
}

function objectAssignable(source: Extract<ResponseValueType, { kind: 'object' }>, target: ResponseValueType): boolean {
    if (target.kind !== 'object') return false;
    return Object.entries(target.properties).every(([name, type]) => Object.hasOwn(source.properties, name) && responseTypeAssignable(source.properties[name], type));
}

function arrayAssignable(source: Extract<ResponseValueType, { kind: 'array' }>, target: ResponseValueType): boolean {
    if (target.kind !== 'array') return false;
    return responseTypeAssignable(source.item, target.item);
}

function assignableContents(source: ResponseValueType, target: ResponseValueType): boolean {
    if (source.kind === 'object') return objectAssignable(source, target);
    if (source.kind === 'array') return arrayAssignable(source, target);
    return true;
}

function acceptsNull(source: ResponseValueType, target: ResponseValueType): boolean {
    return !source.nullable || target.nullable === true;
}

export function responseTypeAssignable(source: ResponseValueType, target: ResponseValueType): boolean {
    if (!acceptsNull(source, target)) return false;
    if (source.kind !== target.kind) return false;
    return assignableContents(source, target);
}

function isObjectValue(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function objectValueMatches(value: unknown, type: Extract<ResponseValueType, { kind: 'object' }>): boolean {
    if (!isObjectValue(value)) return false;
    return Object.entries(type.properties).every(([name, property]) => Object.hasOwn(value, name) && responseValueMatches(value[name], property));
}

function arrayValueMatches(value: unknown, type: Extract<ResponseValueType, { kind: 'array' }>): boolean {
    return Array.isArray(value) && value.every(item => responseValueMatches(item, type.item));
}

function numberValueMatches(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
}

function presentValueMatches(value: unknown, type: ResponseValueType): boolean {
    switch (type.kind) {
        case 'object': return objectValueMatches(value, type);
        case 'array': return arrayValueMatches(value, type);
        case 'number': return numberValueMatches(value);
        default: return typeof value === type.kind;
    }
}

export function responseValueMatches(value: unknown, type: ResponseValueType): boolean {
    return value === null ? type.nullable === true : presentValueMatches(value, type);
}
