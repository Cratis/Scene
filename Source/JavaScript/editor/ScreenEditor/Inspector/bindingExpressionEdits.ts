// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, BindingSourceKind, PropertyValueType, type BindingExpression } from '@cratis/scene.model';
import type { BindingSourceInventory } from '../Binding/bindingSources';
import { allBindingSourceKinds, bindingModes } from '../Binding/bindingExpressionModel';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export type BindingStrings = ScreenEditorStrings['properties']['binding'];

export enum LiteralEditorKind {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Null = 'null',
    Json = 'json',
}

export interface SourceChoice {
    kind: BindingSourceKind;
    label: string;
    disabled?: boolean;
    reason?: string;
}

export function kindOf(binding: BindingExpression): BindingSourceKind {
    return binding.kind ?? BindingSourceKind.DataContext;
}

const BINDING_KEYS = ['kind', 'path', 'query', 'componentId', 'componentPropertyPath', 'value'];

const isPlainObject = (value: unknown): value is object => !!value && typeof value === 'object' && !Array.isArray(value);

export function bindingShapedValue(value: unknown): unknown | undefined {
    if (!isPlainObject(value)) return undefined;
    return BINDING_KEYS.some(key => key in value) ? value : undefined;
}

// Scene rejects a two-way command response binding, so it is offered only when it is what the binding already holds.
export function modesFor(binding: BindingExpression): BindingMode[] {
    return kindOf(binding) === BindingSourceKind.CommandResponse && binding.mode !== BindingMode.TwoWay ? [BindingMode.OneWay] : bindingModes;
}

export function normalize(binding: BindingExpression): BindingExpression {
    switch (kindOf(binding)) {
        case BindingSourceKind.Literal:
            return { ...binding, path: '', query: undefined, componentId: undefined, componentPropertyPath: undefined };
        case BindingSourceKind.QueryResult:
            return { ...binding, componentId: undefined, componentPropertyPath: undefined, value: undefined };
        case BindingSourceKind.ComponentProperty:
            return { ...binding, query: undefined, value: undefined, path: binding.componentPropertyPath ?? binding.path };
        case BindingSourceKind.DataContext:
        case BindingSourceKind.CommandResponse:
            return { ...binding, query: undefined, componentId: undefined, componentPropertyPath: undefined, value: undefined };
    }
}

export function forKind(kind: BindingSourceKind, binding: BindingExpression): Partial<BindingExpression> {
    switch (kind) {
        case BindingSourceKind.Literal: return { kind, path: '', value: binding.value ?? '' };
        case BindingSourceKind.QueryResult: return { kind, query: binding.query, path: binding.path };
        case BindingSourceKind.ComponentProperty: return { kind, componentId: binding.componentId, componentPropertyPath: binding.componentPropertyPath ?? binding.path, path: binding.componentPropertyPath ?? binding.path };
        case BindingSourceKind.CommandResponse: return { kind, path: binding.path, mode: binding.mode === BindingMode.TwoWay ? undefined : binding.mode };
        case BindingSourceKind.DataContext: return { kind, path: binding.path };
    }
}

// What a value says about its own editor, or undefined when a plain value does not decide (a string, or nothing yet).
function literalKindOfValue(value: unknown): LiteralEditorKind | undefined {
    if (value === null) return LiteralEditorKind.Null;
    if (typeof value === 'number') return LiteralEditorKind.Number;
    if (typeof value === 'boolean') return LiteralEditorKind.Boolean;
    if (typeof value === 'object') return LiteralEditorKind.Json;
    return undefined;
}

const literalKindOfType: Partial<Record<PropertyValueType, LiteralEditorKind>> = {
    [PropertyValueType.Number]: LiteralEditorKind.Number,
    [PropertyValueType.Boolean]: LiteralEditorKind.Boolean,
    [PropertyValueType.Object]: LiteralEditorKind.Json,
    [PropertyValueType.Collection]: LiteralEditorKind.Json,
    [PropertyValueType.Json]: LiteralEditorKind.Json,
};

export function literalKindFor(value: unknown, targetType: PropertyValueType): LiteralEditorKind {
    return literalKindOfValue(value) ?? literalKindOfType[targetType] ?? LiteralEditorKind.String;
}

export function literalSignature(value: unknown, targetType: PropertyValueType): string {
    return JSON.stringify({ kind: literalKindFor(value, targetType), value }) ?? 'undefined';
}

export function defaultLiteralValue(kind: LiteralEditorKind): unknown {
    switch (kind) {
        case LiteralEditorKind.String: return '';
        case LiteralEditorKind.Number: return 0;
        case LiteralEditorKind.Boolean: return false;
        case LiteralEditorKind.Null: return null;
        case LiteralEditorKind.Json: return {};
    }
}

function sourceLabel(kind: BindingSourceKind, labels: BindingStrings['sources']): string {
    switch (kind) {
        case BindingSourceKind.DataContext: return labels.dataContext;
        case BindingSourceKind.QueryResult: return labels.queryResult;
        case BindingSourceKind.ComponentProperty: return labels.componentProperty;
        case BindingSourceKind.Literal: return labels.literal;
        case BindingSourceKind.CommandResponse: return labels.commandResponse;
    }
}

function isSourceUnavailable(kind: BindingSourceKind, sources: BindingSourceInventory): boolean {
    return (kind === BindingSourceKind.QueryResult && sources.queryResults.length === 0)
        || (kind === BindingSourceKind.ComponentProperty && sources.componentOutputs.length === 0)
        || (kind === BindingSourceKind.CommandResponse && !sources.commandResponse);
}

function sourceChoiceFor(kind: BindingSourceKind, current: BindingSourceKind, accepted: readonly BindingSourceKind[], sources: BindingSourceInventory, text: BindingStrings): SourceChoice {
    const acceptedKind = accepted.includes(kind);
    const unavailable = isSourceUnavailable(kind, sources);
    const unavailableReason = kind === BindingSourceKind.CommandResponse ? text.commandResponseOutOfScope : text.unavailableSource;
    return {
        kind,
        label: sourceLabel(kind, text.sources),
        disabled: kind !== current && (!acceptedKind || unavailable),
        reason: !acceptedKind ? text.incompatibleSource : unavailable ? unavailableReason : undefined,
    };
}

export function sourceKindChoices(binding: BindingExpression, accepted: readonly BindingSourceKind[], sources: BindingSourceInventory, text: BindingStrings): SourceChoice[] {
    const current = kindOf(binding);
    return allBindingSourceKinds
        .filter(kind => kind !== BindingSourceKind.CommandResponse || accepted.includes(kind) || current === kind)
        .map(kind => sourceChoiceFor(kind, current, accepted, sources, text));
}
