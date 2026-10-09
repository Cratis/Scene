// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationItem } from '@cratis/scene.model';
import { NavigationEntry } from './NavigationEntry';

/**
 * Turns navigation contributions into entries for {@link diagnoseNavigation}. A legacy item carrying only
 * `targetScreen` becomes a destination for that screen, so old and new content are checked the same way.
 */
export function navigationEntriesFrom(items: NavigationItem[]): NavigationEntry[] {
    return items.map(item => ({
        id: item.id,
        destination: item.destination ?? { screen: item.targetScreen, routeParameterBindings: item.routeParameterBindings },
    }));
}
