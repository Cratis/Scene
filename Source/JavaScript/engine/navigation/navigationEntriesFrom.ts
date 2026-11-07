// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletNavigationItem } from '@cratis/scene.model';
import { NavigationEntry } from './NavigationEntry';

/**
 * Turns the items of an outlet of navigation into entries for {@link diagnoseNavigation}, depth first. An item without
 * a target - one that only groups its sub-items - is not an entry itself.
 * @param items The navigation items.
 * @returns The entries.
 */
export function navigationEntriesFrom(items: OutletNavigationItem[]): NavigationEntry[] {
    return items.flatMap(item => [
        ...(item.target === undefined ? [] : [{ id: item.id, destination: item.target }]),
        ...navigationEntriesFrom(item.children ?? []),
    ]);
}
