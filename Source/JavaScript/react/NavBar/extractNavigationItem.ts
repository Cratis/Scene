// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, Contribution, ExternalComponent, NavigationItem } from '@cratis/scene.model';

/**
 * Reads a {@link NavigationItem} out of a {@link Contribution} to the built-in `Navigation` contribution
 * point. `Contribution.content` carries an {@link ExternalComponent} whose open `properties` bag holds the
 * navigation-specific values (`label`, `targetScreen`, `routeParameterBindings`, `order`, `group`) - the
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

    const { label, targetScreen, routeParameterBindings, order, group } = content.properties as Record<string, unknown>;
    if (typeof label !== 'string' || typeof targetScreen !== 'string') {
        return undefined;
    }

    return {
        label,
        targetScreen,
        routeParameterBindings: isBindingExpressionRecord(routeParameterBindings) ? routeParameterBindings : {},
        order: typeof order === 'number' ? order : contribution.order,
        group: typeof group === 'string' ? group : undefined,
    };
}

function isBindingExpressionRecord(value: unknown): value is Record<string, BindingExpression> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
