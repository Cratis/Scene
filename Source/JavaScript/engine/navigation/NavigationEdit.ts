// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationLogo, OutletItem, OutletMode } from '@cratis/scene.model';
import { NavigationEditKind } from './NavigationEditKind';

/**
 * One change to a navigation model's outlets. An edit helper returns the edits that carry out a user's gesture - for
 * example adding an item to an outlet a module inherits is a switch to `extends` and then the add - so every host that
 * offers the gesture makes the same change.
 */
export interface NavigationEdit {
    /** What the edit does. */
    kind: NavigationEditKind;

    /** The module the edit is for; absent for the application level. */
    module?: string;

    /** The outlet the edit changes, such as `sidebar` or `topbarButtons`. */
    outlet?: string;

    /** For `setOutletMode`: the new mode. */
    mode?: OutletMode;

    /** For `setOutletItems`: the items the level puts in the outlet afterwards. */
    items?: OutletItem[];

    /** For `updateItem`, `moveItem`, `removeItem` and `hideItem`: the id of the item. */
    id?: string;

    /** For `addItem` and `moveItem`: the id of the item it becomes a sub-item of; absent for a top-level item. */
    parent?: string;

    /** For `addItem` and `moveItem`: the position among its siblings; after the ones already there when absent. */
    index?: number;

    /** For `addItem`: the item to add; for `updateItem`: the item as it becomes. */
    item?: OutletItem;

    /** For `setLogo`: the application logo. */
    logo?: ApplicationLogo;
}
