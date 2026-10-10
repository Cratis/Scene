// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingScope } from './BindingScope';

/**
 * The scope a nested template or region sees. A data context it declares replaces the inherited one - a
 * detail region bound to the selected row reads that row, not the screen's - while query results and
 * component outputs are inherited, with its own entries shadowing the parent's of the same name. A null
 * data context inherits, as in the C# engine, which cannot tell null from absent. The parent scope is not
 * changed.
 */
export function nestBindingScope(parent: BindingScope, nested: BindingScope): BindingScope {
    return {
        dataContext: nested.dataContext ?? parent.dataContext,
        queryResults: { ...(parent.queryResults ?? {}), ...(nested.queryResults ?? {}) },
        componentOutputs: { ...(parent.componentOutputs ?? {}), ...(nested.componentOutputs ?? {}) },
    };
}
