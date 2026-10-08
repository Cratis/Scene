// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingMode, BindingSourceKind, PropertyValueType } from '@cratis/scene.model';
import { BindingDiagnostic } from './BindingDiagnostic';
import { BindingScope } from './BindingScope';
import { resolveBindingExpression } from './resolveBindingExpression';

/**
 * Validates one binding against available runtime scope and optional component dependency stack.
 */
export function validateBindingExpression(
    binding: BindingExpression,
    scope: BindingScope,
    options: { targetElementId?: string; resolvingElementIds?: string[] } = {},
): BindingDiagnostic[] {
    const diagnostics: BindingDiagnostic[] = [];
    const kind = binding.kind ?? BindingSourceKind.DataContext;

    if (kind === BindingSourceKind.QueryResult && !binding.query) {
        diagnostics.push(problem('missingQuery', 'Query result bindings must name the query they read from.', 'query'));
    }

    if (kind === BindingSourceKind.ComponentProperty) {
        if (!binding.componentId) {
            diagnostics.push(problem('missingComponent', 'Component property bindings must name the source component id.', 'componentId'));
        } else if (!scope.componentOutputs?.[binding.componentId]) {
            diagnostics.push(problem('unknownComponent', `No component output scope exists for '${binding.componentId}'.`, 'componentId'));
        }

        if (binding.componentId && options.targetElementId === binding.componentId) {
            diagnostics.push(problem('bindingCycle', `Component '${binding.componentId}' cannot bind to its own output.`, 'componentId'));
        }

        if (binding.componentId && options.resolvingElementIds?.includes(binding.componentId)) {
            diagnostics.push(problem('bindingCycle', `Binding to '${binding.componentId}' would create a component binding cycle.`, 'componentId'));
        }
    }

    if (binding.mode === BindingMode.TwoWay && kind !== BindingSourceKind.ComponentProperty) {
        diagnostics.push(problem('unsupportedTwoWayBinding', 'Two-way bindings require a component output source.', 'mode'));
    }

    if (binding.expectedValueType !== undefined) {
        const value = resolveBindingExpression(binding, scope);
        if (!matchesExpectedType(value, binding.expectedValueType)) {
            diagnostics.push(problem('bindingTypeMismatch', `Binding value does not match expected ${binding.expectedValueType}.`, 'expectedValueType'));
        }
    }

    return diagnostics;
}

function problem(code: string, message: string, path?: string): BindingDiagnostic {
    return { code, message, path };
}

function matchesExpectedType(value: unknown, type: PropertyValueType): boolean {
    if (value === null || value === undefined) return true;
    switch (type) {
        case PropertyValueType.String:
        case PropertyValueType.Enum:
        case PropertyValueType.Icon:
        case PropertyValueType.Destination:
        case PropertyValueType.QueryReference:
            return typeof value === 'string' || (typeof value === 'object' && !Array.isArray(value));
        case PropertyValueType.Number:
            return typeof value === 'number' && !Number.isNaN(value);
        case PropertyValueType.Boolean:
            return typeof value === 'boolean';
        case PropertyValueType.Collection:
            return Array.isArray(value);
        case PropertyValueType.Object:
            return typeof value === 'object' && !Array.isArray(value);
        case PropertyValueType.Json:
            return true;
    }
}
