// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind } from './OutletKind';
import { OutletSubject } from './OutletSubject';
import type { OutletItem } from './OutletItem';

/**
 * A list of items a layout or template offers, with its default items: Screenplay's
 * `outlet <name> of actions|filters|tabs|stats|navigation [for item|screen] [in <slot>]`. Lower levels inherit, extend
 * or override it ({@link OutletRefinement}) and any level can contribute to it ({@link OutletContribution}).
 *
 * An outlet is not a slot: a slot is a region content is placed in, an outlet is a list of items.
 */
export interface Outlet {
    /** The name lower levels and contributions use, such as `toolbar` or `rowActions`. */
    name: string;

    /** What the outlet lists. */
    kind: OutletKind;

    /** What the outlet's actions act on; only an outlet of actions has one. */
    subject?: OutletSubject;

    /** The slot the outlet owns; an outlet of tabs shows the chosen tab's screen there. */
    slot?: string;

    /** The default items, in order. */
    defaults: OutletItem[];
}

/** The own property names of {@link Outlet}, checked against the shared shape manifest. */
export const OutletPropertyNames: (keyof Outlet)[] = ['name', 'kind', 'subject', 'slot', 'defaults'];
