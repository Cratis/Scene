// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind, PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';

// The editor kinds of the values that have no fields to describe - lists of words or numbers, a word or a list of words, a scalar, a
// record under the author's own names - are Scene's own, so a package describes them once and every host edits them alike.
export const stringListEditorKind: string = PropertyEditorKind.StringList;
export const numberListEditorKind: string = PropertyEditorKind.NumberList;
export const stringOrListEditorKind: string = PropertyEditorKind.StringOrList;
export const scalarEditorKind: string = PropertyEditorKind.Scalar;
export const stringMapEditorKind: string = PropertyEditorKind.StringMap;

const plainKinds: readonly string[] = [stringListEditorKind, numberListEditorKind, stringOrListEditorKind, scalarEditorKind];

// A value of plain entries: a list of words or numbers, a word or a list of words, or one scalar.
export const isPrimitiveList = (descriptor: PropertyDescriptor): boolean =>
    descriptor.valueType === PropertyValueType.Json && descriptor.editorKind !== undefined && plainKinds.includes(descriptor.editorKind);

// A record whose keys are the author's own: nothing to describe but what its values are.
export const isStringMap = (descriptor: PropertyDescriptor): boolean =>
    descriptor.valueType === PropertyValueType.Object && descriptor.properties === undefined && descriptor.editorKind === stringMapEditorKind;

export const isObjectWithFields = (descriptor: PropertyDescriptor): boolean =>
    descriptor.valueType === PropertyValueType.Object && descriptor.properties !== undefined;

export const isCollectionOfRecords = (descriptor: PropertyDescriptor): boolean =>
    descriptor.valueType === PropertyValueType.Collection && descriptor.item !== undefined;

// Whether the structured editor can draw a property from its descriptor alone, by what it describes rather than by raw text.
export const isStructured = (descriptor: PropertyDescriptor): boolean =>
    isPrimitiveList(descriptor) || isStringMap(descriptor) || isObjectWithFields(descriptor) || isCollectionOfRecords(descriptor);

export const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

// The record with one field set. A field that is set to nothing is removed rather than stored empty, so a record never carries
// what the author did not set; a record left with no fields is nothing at all.
export function withField(record: unknown, path: string, value: unknown): Record<string, unknown> | undefined {
    const next: Record<string, unknown> = { ...(isRecord(record) ? record : {}) };
    if (value === undefined) delete next[path];
    else next[path] = value;
    return Object.keys(next).length === 0 ? undefined : next;
}

// An item of a collection: the identity Scene requires, which is assigned once and never an array index.
// An item of a positional collection - authored data, told apart by position - has none.
export const newItem = (positional = false): Record<string, unknown> => positional ? {} : { id: globalThis.crypto.randomUUID() };

// An item as a record that has the identity Scene requires: kept when it has one, given one when it has not.
export const identified = (item: unknown, positional = false): Record<string, unknown> =>
    positional ? (isRecord(item) ? item : {}) : isRecord(item) && typeof item.id === 'string' && item.id !== '' ? item : { ...(isRecord(item) ? item : {}), id: globalThis.crypto.randomUUID() };

export function withItem(items: readonly unknown[], index: number, item: unknown): unknown[] {
    return items.map((candidate, candidateIndex) => candidateIndex === index ? item : candidate);
}

export function withoutItem(items: readonly unknown[], index: number): unknown[] {
    return items.filter((_, candidateIndex) => candidateIndex !== index);
}

// The items with one moved by an offset, staying in range; moving past an end changes nothing.
export function movedItem(items: readonly unknown[], index: number, offset: number): unknown[] {
    const target = index + offset;
    if (target < 0 || target >= items.length) return [...items];
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

// The value as the descriptor describes it: every collection item has the identity Scene requires, however deep it is. Anything else
// is left exactly as it is - this adds what was never there, it does not correct what is wrong.
export function withIdentities(descriptor: PropertyDescriptor, value: unknown): unknown {
    if (isCollectionOfRecords(descriptor) && Array.isArray(value)) {
        return value.map(item => {
            const identifiedItem = isRecord(item) ? identified(item, descriptor.item!.positional === true) : item;
            if (!isRecord(identifiedItem)) return identifiedItem;
            return Object.fromEntries(Object.entries(identifiedItem).map(([key, field]) => {
                const fieldDescriptor = descriptor.item!.properties.find(candidate => candidate.path === key);
                return [key, fieldDescriptor ? withIdentities(fieldDescriptor, field) : field];
            }));
        });
    }

    if (isObjectWithFields(descriptor) && isRecord(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, field]) => {
            const fieldDescriptor = descriptor.properties!.find(candidate => candidate.path === key);
            return [key, fieldDescriptor ? withIdentities(fieldDescriptor, field) : field];
        }));
    }

    return value;
}

export const asList = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
