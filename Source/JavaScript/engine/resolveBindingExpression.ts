// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingNullBehavior, BindingSourceKind } from '@cratis/scene.model';
import { BindingScope } from './BindingScope';

/**
 * Resolves a typed binding against the shared runtime binding scope.
 */
export function resolveBindingExpression(binding: BindingExpression, scope: BindingScope): unknown {
    const kind = binding.kind ?? BindingSourceKind.DataContext;
    if (kind === BindingSourceKind.Literal) return binding.value;

    const source = sourceValue(binding, scope, kind);
    const value = readPath(source, sourcePath(binding, kind));
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
            return scope.dataContext;
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

function readPath(source: unknown, path: string): unknown {
    if (!path) return source;
    return path.split('.').reduce<unknown>((current, segment) => {
        if (current === null || current === undefined) return undefined;
        if (typeof current !== 'object') return undefined;
        return (current as Record<string, unknown>)[segment];
    }, source);
}
