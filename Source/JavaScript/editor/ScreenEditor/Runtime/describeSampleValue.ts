// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { numberListEditorKind, stringListEditorKind } from '../PropertyEditors/Structured/structuredValue';

export const labelOf = (path: string): string => path.replace(/([A-Z])/g, ' $1').replace(/^./, first => first.toUpperCase());

// What one entry of a list is called, from what the list is: "Datasets" holds a "Dataset".
export const singularOf = (plural: string): string => /ies$/i.test(plural) ? `${plural.slice(0, -3)}y` : /(ss|us)$/i.test(plural) || !/s$/i.test(plural) ? plural : plural.slice(0, -1);

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

// Describes a property from a sample of what it holds, down to every field of every nested record, so it is edited through what it is
// rather than as text: a number is a number, a list of words is a list, a list of records is a collection of items with their fields,
// and a record is an object with its fields.
//
// A sample shows one shape, not every field a value may have, so what it describes is open: fields it does not show are kept as they
// are. The descriptor is the shape the sample shows. A collection item has an `id` of its own, which Scene assigns, so a sample's
// own `id` field is not an item field.
export function describeSampleValue(path: string, value: unknown, label = labelOf(path)): PropertyDescriptor {
    const base = { path, label, group: 'Content' };

    if (typeof value === 'number') return { ...base, valueType: PropertyValueType.Number };
    if (typeof value === 'boolean') return { ...base, valueType: PropertyValueType.Boolean };
    if (Array.isArray(value)) return describeList(base, value);
    if (isRecord(value)) return { ...base, valueType: PropertyValueType.Object, properties: describeFields(value), open: true };
    return { ...base, valueType: PropertyValueType.String };
}

function describeFields(record: Record<string, unknown>, skip: readonly string[] = []): PropertyDescriptor[] {
    return Object.entries(record).filter(([key]) => !skip.includes(key)).map(([key, value]) => describeNested(key, value));
}

// The fields of a nested record are shown under their parent, not under a group of their own.
function describeNested(path: string, value: unknown): PropertyDescriptor {
    return describeSampleValue(path, value);
}

function describeList(base: { path: string; label: string; group: string }, list: readonly unknown[]): PropertyDescriptor {
    if (list.length > 0 && list.every(entry => typeof entry === 'string')) return { ...base, valueType: PropertyValueType.Json, editorKind: stringListEditorKind };
    if (list.length > 0 && list.every(entry => typeof entry === 'number')) return { ...base, valueType: PropertyValueType.Json, editorKind: numberListEditorKind };

    // A list of records - or of records beside plain entries, as a menu has separators beside its items - is a collection whose items
    // have every field any of the records has, each described by the first value it appears with.
    const merged: Record<string, unknown> = {};
    for (const entry of list.filter(isRecord)) for (const [key, value] of Object.entries(entry)) if (!(key in merged)) merged[key] = value;
    return { ...base, valueType: PropertyValueType.Collection, item: { label: singularOf(base.label), properties: describeFields(merged, ['id']), open: true } };
}
