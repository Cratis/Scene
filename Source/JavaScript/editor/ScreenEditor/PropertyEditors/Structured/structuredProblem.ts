// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { isCollectionOfRecords, isObjectWithFields, isRecord, numberListEditorKind, scalarEditorKind, stringListEditorKind, stringMapEditorKind, stringOrListEditorKind } from './structuredValue';

const isWords = (value: unknown): boolean => Array.isArray(value) && value.every(entry => typeof entry === 'string');

// What is wrong with a value for the kind of plain value its descriptor says it is, found at any depth. Scene accepts any JSON for these
// - a list of words is a `json` property - so only the editor knows that a number where words belong cannot be drawn, and says so rather
// than showing an empty list that an edit would then overwrite.
export function structuredProblem(descriptor: PropertyDescriptor, value: unknown, path = descriptor.label): string | undefined {
    if (value === undefined || value === null) return undefined;

    if (descriptor.valueType === PropertyValueType.Json) {
        switch (descriptor.editorKind) {
            case stringListEditorKind: return isWords(value) ? undefined : `${path} is not a list of words`;
            case numberListEditorKind: return Array.isArray(value) && value.every(entry => typeof entry === 'number') ? undefined : `${path} is not a list of numbers`;
            case stringOrListEditorKind: return typeof value === 'string' || isWords(value) ? undefined : `${path} is not a word or a list of words`;
            case scalarEditorKind: return ['string', 'number', 'boolean'].includes(typeof value) ? undefined : `${path} is not a word, a number or a yes or no`;
        }
    }

    if (descriptor.valueType === PropertyValueType.Object && descriptor.editorKind === stringMapEditorKind && descriptor.properties === undefined) {
        return isRecord(value) ? undefined : `${path} is not a record of values`;
    }

    if (isObjectWithFields(descriptor) && isRecord(value)) {
        return descriptor.properties!.map(field => structuredProblem(field, value[field.path], `${path} / ${field.label}`)).find(problem => problem !== undefined);
    }

    if (isCollectionOfRecords(descriptor) && Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
            if (!isRecord(item)) continue;
            const problem = descriptor.item!.properties.map(field => structuredProblem(field, item[field.path], `${path} ${index + 1} / ${field.label}`)).find(found => found !== undefined);
            if (problem) return problem;
        }
    }

    return undefined;
}
