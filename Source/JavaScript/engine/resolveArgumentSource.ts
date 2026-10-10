// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind } from '@cratis/scene.model';
import { BindingScope } from './BindingScope';
import { resolveBindingExpression } from './resolveBindingExpression';

/** The prefix of an argument source that reads another element's output. */
export const componentArgumentSourcePrefix = 'component.';

/**
 * Resolves where a command argument comes from, as an action's argument mapping writes it.
 *
 * `component.<id>.<output>` reads an output another element publishes - an input's `value`, a table's
 * `selectedItem.id` - from the same output scope a `componentProperty` binding reads. Element ids may contain
 * dots, so the longest id with outputs in scope wins: `component.order.lines.value` reads `value` of
 * `order.lines` when that element exists. Any other source is a path in the data context. An empty source,
 * or an element with no outputs in scope, resolves as absent.
 *
 * The C# engine (`ArgumentSources.Resolve`) behaves identically; both run `argument-source-fixtures.json`.
 */
export function resolveArgumentSource(source: string, scope: BindingScope): unknown {
    if (!source) return undefined;
    if (!source.startsWith(componentArgumentSourcePrefix)) return resolveBindingExpression({ path: source }, scope);

    const reference = source.substring(componentArgumentSourcePrefix.length);
    const componentId = Object.keys(scope.componentOutputs ?? {})
        .filter(id => reference === id || reference.startsWith(`${id}.`))
        .sort((left, right) => right.length - left.length)[0];
    if (componentId === undefined) return undefined;

    return resolveBindingExpression({ kind: BindingSourceKind.ComponentProperty, componentId, path: reference.substring(componentId.length + 1) }, scope);
}
