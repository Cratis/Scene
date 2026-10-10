// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingNullBehavior, BindingSourceKind } from '@cratis/scene.model';
import { BindingScope } from './BindingScope';

/**
 * Resolves a typed binding against the shared runtime binding scope.
 */
export function resolveBindingExpression(binding: BindingExpression, scope: BindingScope): unknown {
    const kind = binding.kind ?? BindingSourceKind.DataContext;

    // A literal without a value is absent, whether the author wrote `null` or nothing: the C# model cannot
    // tell the two apart, and both engines must resolve the same document to the same value.
    const value = kind === BindingSourceKind.Literal
        ? binding.value ?? undefined
        : readPath(sourceValue(binding, scope, kind), sourcePath(binding, kind));
    if (value !== null && value !== undefined) return value;

    if (binding.nullBehavior === BindingNullBehavior.Preserve) return undefined;
    if (binding.nullBehavior === BindingNullBehavior.Clear) return null;
    return value;
}

/**
 * Creates a legacy resolver function from a binding scope.
 */
export function createBindingResolver(scope: BindingScope): (binding: BindingExpression) => unknown {
    return binding => resolveBindingExpression(binding, scope);
}

function sourceValue(binding: BindingExpression, scope: BindingScope, kind: BindingSourceKind): unknown {
    switch (kind) {
        case BindingSourceKind.DataContext:
            return scope.dataContext ?? undefined;
        case BindingSourceKind.QueryResult:
            return binding.query ? scope.queryResults?.[binding.query] : undefined;
        case BindingSourceKind.ComponentProperty:
            return binding.componentId ? scope.componentOutputs?.[binding.componentId] : undefined;
        case BindingSourceKind.Literal:
            return binding.value;
    }
}

function sourcePath(binding: BindingExpression, kind: BindingSourceKind): string {
    if (kind === BindingSourceKind.ComponentProperty) return binding.componentPropertyPath ?? binding.path;
    return binding.path;
}

/**
 * Reads a dotted path. Only own properties and array indexes are read - never inherited members such as
 * `constructor` - and anything that is not an object or array ends the walk, so the C# engine can follow
 * exactly the same rule over JSON.
 */
function readPath(source: unknown, path: string): unknown {
    if (!path) return source;
    return path.split('.').reduce<unknown>((current, segment) => {
        if (current === null || current === undefined || typeof current !== 'object') return undefined;
        if (Array.isArray(current)) return /^(0|[1-9][0-9]*)$/.test(segment) ? current[Number(segment)] : undefined;
        return Object.hasOwn(current, segment) ? (current as Record<string, unknown>)[segment] : undefined;
    }, source);
}
