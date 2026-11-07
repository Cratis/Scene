// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemBase } from './OutletItemBase';
import { OutletItemKind } from './OutletItemKind';
import type { OutletItem } from './OutletItem';

/**
 * A group of actions shown as one menu, such as "More". It holds buttons, menu entries and separators, never another
 * group.
 */
export interface OutletGroup extends OutletItemBase {
    /** Always a group. */
    kind: OutletItemKind.Group;

    /** The text of the menu. */
    title: string;

    /** Qualified icon reference, when the group has one. */
    icon?: string;

    /** The actions in the group, in order. */
    items: OutletItem[];
}

/** The own property names of {@link OutletGroup}, checked against the shared shape manifest. */
export const OutletGroupPropertyNames: (keyof OutletGroup)[] = ['kind', 'title', 'icon', 'items'];
