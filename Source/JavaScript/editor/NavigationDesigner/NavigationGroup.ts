// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationItemWithSource } from './NavigationItemWithSource';

/**
 * One group of {@link NavigationItemWithSource}s sharing the same `item.group` - see `groupNavigationItems`.
 */
export interface NavigationGroup {
    /** The group name, or `undefined` for items that declare no `group`. */
    name: string | undefined;
    items: NavigationItemWithSource[];
}
