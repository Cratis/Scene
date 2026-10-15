// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationLogo, NavigationRegionKind, NavigationRegionMode, NavItem } from '@cratis/scene.model';
import { NavigationEditKind } from './NavigationEditKind';

/**
 * One change to a {@link NavigationModel}. An edit helper returns the edits that carry out a user's gesture - for
 * example adding an item to an inheriting region is a switch to `extend` and then the add - so every host that offers
 * the gesture makes the same change.
 */
export interface NavigationEdit {
    /** What the edit does. */
    kind: NavigationEditKind;

    /** The module the edit is for; absent for the application level. */
    module?: string;

    /** The region the edit changes. */
    region?: NavigationRegionKind;

    /** For `setRegionMode`: the new mode. */
    mode?: NavigationRegionMode;

    /** For `setRegionItems`: the items the level's region holds afterwards. */
    items?: NavItem[];

    /** For `addItem`: the id of the item the new item becomes a sub-item of; absent for a top-level item. */
    parent?: string;

    /** For `addItem`: the item to add, after the items already there. */
    item?: NavItem;

    /** For `setLogo`: the application logo. */
    logo?: ApplicationLogo;
}
