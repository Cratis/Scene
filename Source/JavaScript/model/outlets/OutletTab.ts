// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemBase } from './OutletItemBase';
import { OutletItemKind } from './OutletItemKind';

/**
 * A tab of an outlet of tabs: Screenplay's `tab <id> title "…" shows <screen>`. The screen shows in the slot the
 * outlet owns.
 */
export interface OutletTab extends OutletItemBase {
    /** Always a tab. */
    kind: OutletItemKind.Tab;

    /** The label of the tab. */
    title: string;

    /** The qualified name of the screen the tab shows. */
    shows: string;
}

/** The own property names of {@link OutletTab}, checked against the shared shape manifest. */
export const OutletTabPropertyNames: (keyof OutletTab)[] = ['kind', 'title', 'shows'];
