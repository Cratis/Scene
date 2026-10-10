// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingScope } from './BindingScope';

/**
 * The scope after elements leave the tree - unmounted, deleted or renamed to a new id. Their output
 * properties are removed, so a binding to them resolves as absent and validates as `unknownComponent`
 * instead of reading a value from an element that no longer exists.
 */
export function removeComponentOutputs(scope: BindingScope, elementIds: string[]): BindingScope {
    const removed = new Set(elementIds);
    const componentOutputs = Object.fromEntries(Object.entries(scope.componentOutputs ?? {}).filter(([id]) => !removed.has(id)));
    return { ...scope, componentOutputs };
}
