// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, BindingNullBehavior, BindingSourceKind, PropertyValueType, type BindingExpression, type InspectedProperty } from '@cratis/scene.model';

export const allBindingSourceKinds = [
    BindingSourceKind.DataContext,
    BindingSourceKind.QueryResult,
    BindingSourceKind.ComponentProperty,
    BindingSourceKind.Literal,
    BindingSourceKind.CommandResponse,
];

// A command response only has a value inside a command's continuation, so a property that names no kinds does not accept it.
export const defaultAcceptedBindingKinds = [
    BindingSourceKind.DataContext,
    BindingSourceKind.QueryResult,
    BindingSourceKind.ComponentProperty,
    BindingSourceKind.Literal,
];

export const bindingModes = [BindingMode.OneWay, BindingMode.TwoWay];
export const bindingNullBehaviors = [BindingNullBehavior.Propagate, BindingNullBehavior.Clear, BindingNullBehavior.Preserve];
export const expectedValueTypes = [
    PropertyValueType.String,
    PropertyValueType.Number,
    PropertyValueType.Boolean,
    PropertyValueType.Enum,
    PropertyValueType.Icon,
    PropertyValueType.Destination,
    PropertyValueType.QueryReference,
    PropertyValueType.Collection,
    PropertyValueType.Object,
    PropertyValueType.Json,
];

export function isBindingExpression(value: unknown): value is BindingExpression {
    const candidate = value as Partial<BindingExpression> | null | undefined;
    return !!candidate && typeof candidate === 'object' && typeof candidate.path === 'string'
        && (candidate.kind === undefined || allBindingSourceKinds.includes(candidate.kind));
}

export function isBindingProperty(property: InspectedProperty): boolean {
    return (property.descriptor.acceptedBindingKinds?.length ?? 0) > 0 || isBindingExpression(property.effectiveValue);
}

export function defaultBinding(property: InspectedProperty): BindingExpression {
    const kind = property.descriptor.acceptedBindingKinds?.[0] ?? BindingSourceKind.DataContext;
    return { kind, path: '', mode: property.descriptor.bindingMode, expectedValueType: property.descriptor.valueType };
}
