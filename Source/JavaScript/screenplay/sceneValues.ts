// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type {
    ExpressionSyntax, ListExpressionSyntax, LiteralExpressionSyntax, ObjectExpressionSyntax, UiBindingSyntax,
} from './Syntax/ScreenplaySyntax';
import { bindingKinds, bindingModes, nullBehaviors } from './sceneEnumerations';
import type { JsonValue } from './json';

// The import half of SceneValues: Screenplay literal expressions and UI bindings as the values a Scene document holds.

// A Screenplay expression as the JSON a Scene property carries. Only a literal, a list and an object are a value;
// every other expression is something the screen computes, which a Scene property holds as nothing.
export const expressionToJson = (expression: ExpressionSyntax | null | undefined): JsonValue | undefined => {
    if (expression === null || expression === undefined) return undefined;
    switch (expression.kind) {
        case 'LiteralExpressionSyntax': return literalToJson((expression as LiteralExpressionSyntax).value);
        case 'ListExpressionSyntax': return (expression as ListExpressionSyntax).items.map(item => expressionToJson(item) ?? null);
        case 'ObjectExpressionSyntax': {
            const result: Record<string, JsonValue> = {};
            for (const member of (expression as ObjectExpressionSyntax).members) result[member.name] = expressionToJson(member.value) ?? null;
            return result;
        }
        default: return undefined;
    }
};

// An exact number keeps its canonical spelling, so a decimal the document wrote exactly is not rounded through a
// double on the way into the screen.
const literalToJson = (value: LiteralExpressionSyntax['value']): JsonValue | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return value;
    const canonical = value.canonical;
    return canonical === undefined ? undefined : Number(canonical);
};

// A Screenplay UI binding as the binding a Scene document holds. A data-context binding writes no kind, because
// that is the kind a binding has when it says none.
export const bindingToJson = (binding: UiBindingSyntax): Record<string, JsonValue> => {
    const json: Record<string, JsonValue> = { path: binding.path };
    const kind = kindIndexOf(binding.bindingKind);
    if (kind > 0) json.kind = bindingKinds[kind];
    optional(json, 'query', binding.query);
    optional(json, 'componentId', binding.componentId);
    optional(json, 'componentPropertyPath', binding.componentPropertyPath);
    optional(json, 'mode', spelling(binding.mode, bindingModes));
    optional(json, 'nullBehavior', spelling(binding.nullBehavior, nullBehaviors));
    optional(json, 'expectedValueType', binding.expectedValueType);
    if (kind === bindingKinds.indexOf('literal')) json.value = expressionToJson(binding.literal) ?? null;
    return json;
};

export const optional = (json: Record<string, JsonValue>, member: string, value: string | null | undefined): void => {
    if (value !== null && value !== undefined) json[member] = value;
};

// 'Invalid' is the kind a binding that says nothing has; Screenplay numbers it 0 and Scene writes no kind for it or
// for the data context, so both land on the data context here.
const kindIndexOf = (kind: string | undefined): number => {
    if (kind === undefined || kind === 'Invalid' || kind === 'DataContext') return 0;
    const index = bindingKinds.findIndex(name => name.toLowerCase() === kind.toLowerCase());
    return index < 0 ? 0 : index;
};

const spelling = (value: string | null | undefined, names: readonly string[]): string | undefined => {
    if (value === null || value === undefined) return undefined;
    return names.find(name => name.toLowerCase() === value.toLowerCase());
};
