// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '../common/DestinationReference';
import { OutletItemBase } from './OutletItemBase';
import { OutletItemKind } from './OutletItemKind';

/**
 * An item of an outlet of navigation: Screenplay's `item <id> title "…" target <Module>.<Feature>`. It is what a
 * navigation region's item is, as an outlet item.
 */
export interface OutletNavigationItem extends OutletItemBase {
    /** Always a navigation item. */
    kind: OutletItemKind.Navigation;

    /** The text shown. */
    title: string;

    /** Qualified icon reference, when the item has one. */
    icon?: string;

    /** The module, feature or screen the item opens. */
    target?: DestinationReference;

    /** The slot the target opens in; the primary slot when absent. */
    slot?: string;

    /** The sub-items, in order. */
    children?: OutletNavigationItem[];
}

/** The own property names of {@link OutletNavigationItem}, checked against the shared shape manifest. */
export const OutletNavigationItemPropertyNames: (keyof OutletNavigationItem)[] = ['kind', 'title', 'icon', 'target', 'slot', 'children'];
