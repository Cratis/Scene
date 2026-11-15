// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BindingTypeScope } from '@cratis/scene.engine';

// The values a table's query arguments can be drawn from in a Studio screen: the route, the selection, local inputs.
export function createBindingScope(types: Record<string, string>): BindingTypeScope {
    return { types };
}
