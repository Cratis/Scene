// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';

/**
 * A contribution to the built-in `Navigation` contribution point. How `navigate to <Screen>` becomes a
 * concrete route (URL path, query string, or native deep link) is owned by the renderer's NavBar widget,
 * not this record — this only carries the declared shape.
 */
export interface NavigationItem {
    label: string;
    targetScreen: string;
    routeParameterBindings: Record<string, BindingExpression>;
    order?: number;
    group?: string;
}

export const NavigationItemPropertyNames: (keyof NavigationItem)[] = [
    'label', 'targetScreen', 'routeParameterBindings', 'order', 'group',
];
