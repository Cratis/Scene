// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, DestinationReference } from '../common';

/**
 * A contribution to the built-in `Navigation` contribution point. How `navigate to <Screen>` becomes a
 * concrete route (URL path, query string, or native deep link) is owned by the renderer's NavBar widget,
 * not this record — this only carries the declared shape.
 */
export interface NavigationItem {
    /** Stable identity for this contribution, independent of the label. */
    id?: string;

    label: string;

    /** Qualified icon reference (`library:name`) for toolbar/navigation chrome. */
    icon?: string;

    /** Whether chrome shows icon, text, or both. */
    presentation?: string;

    /** Legacy screen target; prefer `destination` for new content. */
    targetScreen: string;

    /** Legacy parameter bindings; prefer `destination.routeParameterBindings` for new content. */
    routeParameterBindings: Record<string, BindingExpression>;

    /** The typed destination this item activates. */
    destination?: DestinationReference;

    order?: number;
    group?: string;
}

export const NavigationItemPropertyNames: (keyof NavigationItem)[] = [
    'id', 'label', 'icon', 'presentation', 'targetScreen', 'routeParameterBindings', 'destination', 'order', 'group',
];
