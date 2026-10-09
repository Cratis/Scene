// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference, DialogTemplate, Layout, Screen, ScreenTemplate } from '@cratis/scene.model';
import { NavigationDiagnostic, diagnoseNavigation } from './navigation';

/**
 * A navigation problem as {@link validateNavigationDestinations} reports it.
 */
export type NavigationDestinationDiagnostic = NavigationDiagnostic;

/**
 * Validates destinations against the outlet/route declarations owned by layouts and templates, and - when
 * the screens and dialog templates are given - against the targets that actually exist.
 *
 * A shorthand for {@link diagnoseNavigation} over destinations without entry identities.
 */
export function validateNavigationDestinations(
    destinations: DestinationReference[],
    surfaces: { layouts?: Layout[]; screenTemplates?: ScreenTemplate[]; screens?: Screen[]; dialogTemplates?: DialogTemplate[] } = {},
): NavigationDestinationDiagnostic[] {
    return diagnoseNavigation({ entries: destinations.map(destination => ({ destination })), ...surfaces });
}
