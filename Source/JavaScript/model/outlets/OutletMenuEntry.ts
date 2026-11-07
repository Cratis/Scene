// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletAction } from './OutletAction';
import { OutletItemKind } from './OutletItemKind';

/**
 * An entry of a menu: an action shown as a line of a menu rather than as a button.
 */
export interface OutletMenuEntry extends OutletAction {
    /** Always a menu entry. */
    kind: OutletItemKind.MenuEntry;
}

/** The own property names of {@link OutletMenuEntry}, checked against the shared shape manifest. */
export const OutletMenuEntryPropertyNames: (keyof OutletMenuEntry)[] = ['kind'];
