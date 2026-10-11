// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, Contribution, DestinationReference, ExternalComponent, NavigationItem } from '@cratis/scene.model';

/**
 * Reads a {@link NavigationItem} out of a {@link Contribution} to the built-in `Navigation` contribution
 * point. `Contribution.content` carries an {@link ExternalComponent} whose open `properties` bag holds the
 * navigation-specific values (`label`, `targetScreen`, `routeParameterBindings`, `order`, `group`, and the
 * optional `id`, `icon`, `presentation`, `destination` and `hierarchy`) - the
 * same names as {@link NavigationItem}'s own fields. This property-bag contract is Scene#2's own choice,
 * made without a real Screenplay-to-Scene translation to confirm it against (Stage#37 hasn't been built
 * yet) - whoever builds that seam should either produce contributions matching this contract or this
 * function should move to match whatever Stage#37 actually emits.
 *
 * @param contribution The contribution to read.
 * @returns The extracted {@link NavigationItem}, or `undefined` when `contribution.content` isn't an {@link ExternalComponent} or is missing a required property.
 */
export function extractNavigationItem(contribution: Contribution): NavigationItem | undefined {
    const content = contribution.content as Partial<ExternalComponent>;
    if (!content.properties) {
        return undefined;
    }

    const { id, label, icon, presentation, targetScreen, routeParameterBindings, destination, order, group, hierarchy } = content.properties as Record<string, unknown>;
    if (typeof label !== 'string' || typeof targetScreen !== 'string') {
        return undefined;
    }

    return {
        id: typeof id === 'string' ? id : undefined,
        label,
        icon: typeof icon === 'string' ? icon : undefined,
        presentation: typeof presentation === 'string' ? presentation : undefined,
        targetScreen,
        routeParameterBindings: isBindingExpressionRecord(routeParameterBindings) ? routeParameterBindings : {},
        order: typeof order === 'number' ? order : contribution.order,
        destination: isDestination(destination) ? destination : undefined,
        group: typeof group === 'string' ? group : undefined,
        hierarchy: Array.isArray(hierarchy) ? hierarchy.filter((part): part is string => typeof part === 'string') : undefined,
    };
}

function isDestination(value: unknown): value is DestinationReference {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBindingExpressionRecord(value: unknown): value is Record<string, BindingExpression> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
