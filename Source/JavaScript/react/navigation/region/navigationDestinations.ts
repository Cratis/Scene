// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, DestinationReference, NavigationRegionKind, NavigationModel } from '@cratis/scene.model';
import { ApplicationStructureIndex, EffectiveNavItem, effectiveNavigation } from '@cratis/scene.engine';
import { navigationItemDestination } from './navigationItemDestination';

function flatten(items: EffectiveNavItem[]): EffectiveNavItem[] {
    return items.flatMap(item => [item, ...flatten(item.children ?? [])]);
}

/**
 * Every destination the navigation of the application and of each module can lead to, once each: what a
 * `SceneNavigationHost` is given as `destinations` so deep links to a navigation item resolve, and an item that renders
 * into a nested outlet is placed with the screen that declares the outlet.
 */
export function navigationDestinations(
    structure: ApplicationStructure | ApplicationStructureIndex,
    navigation: NavigationModel,
    screenFor?: (item: EffectiveNavItem) => string | undefined,
): DestinationReference[] {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);
    const modules = [undefined, ...index.structure.modules.map(module => module.id)];
    const seen = new Set<string>();
    const destinations: DestinationReference[] = [];

    for (const module of modules) {
        for (const region of [NavigationRegionKind.Topbar, NavigationRegionKind.Sidebar]) {
            for (const item of flatten(effectiveNavigation(index, navigation, module, region).items)) {
                const destination = navigationItemDestination(item, screenFor);
                if (destination === undefined) continue;
                const key = JSON.stringify(destination);
                if (seen.has(key)) continue;
                seen.add(key);
                destinations.push(destination);
            }
        }
    }

    return destinations;
}
