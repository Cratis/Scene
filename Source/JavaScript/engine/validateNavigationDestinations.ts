// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference, Layout, ScreenTemplate } from '@cratis/scene.model';

export interface NavigationDestinationDiagnostic {
    code: string;
    message: string;
}

/**
 * Validates destinations against the outlet/route declarations owned by layouts and templates.
 */
export function validateNavigationDestinations(
    destinations: DestinationReference[],
    surfaces: { layouts?: Layout[]; screenTemplates?: ScreenTemplate[] } = {},
): NavigationDestinationDiagnostic[] {
    const diagnostics: NavigationDestinationDiagnostic[] = [];
    const outlets = new Set<string>();
    const routes = new Set<string>();

    for (const surface of [...(surfaces.layouts ?? []), ...(surfaces.screenTemplates ?? [])]) {
        for (const outlet of surface.outlets ?? []) {
            if (outlets.has(outlet.name)) diagnostics.push({ code: 'duplicateOutlet', message: `Outlet '${outlet.name}' is declared more than once.` });
            outlets.add(outlet.name);
        }
    }

    for (const destination of destinations) {
        if (destination.outlet && !outlets.has(destination.outlet)) {
            diagnostics.push({ code: 'missingOutlet', message: `Destination targets missing outlet '${destination.outlet}'.` });
        }
        if (destination.route) {
            if (routes.has(destination.route)) diagnostics.push({ code: 'duplicateRoute', message: `Route '${destination.route}' is used by more than one destination.` });
            routes.add(destination.route);
        }
        if (!destination.screen && !destination.module && !destination.route && !destination.dialog) {
            diagnostics.push({ code: 'unavailableTarget', message: 'Destination must name a screen, stable identity, route or dialog.' });
        }
    }

    return diagnostics;
}
