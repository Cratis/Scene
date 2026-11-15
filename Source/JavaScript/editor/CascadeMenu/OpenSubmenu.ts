// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PanelRect } from './placeCascadePanel';

/** A submenu that is open, and the row it opened from. */
export interface OpenSubmenu {
    /** The identifier of the row that opened it. */
    id: string;

    /** Where that row is, which the panel is placed beside. */
    rect: PanelRect;
}
