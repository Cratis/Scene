// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Rect } from '../Surface/dropRegionRects';

export type ToolbarSide = 'above' | 'below';

export interface ToolbarPlacementInputs {

    // The selected item, and the room the toolbar may use - the surface - in the same coordinates.
    anchor: Rect;
    bounds: Rect;
    size: { width: number; height: number };

    // Where it goes if there is room: above the item for a toolbar button, below it for a navigation item (DM4).
    prefer: ToolbarSide;
    gap?: number;
}

export interface ToolbarPlacement {
    left: number;
    top: number;
    side: ToolbarSide;
}

// Where the floating toolbar goes: left-aligned with the item, on the preferred side, and on the other side when there is no room for it on
// that one - so it avoids covering the item's neighbours without leaving the surface. Without room on either side it is held inside the surface.
export function placeFloatingToolbar({ anchor, bounds, size, prefer, gap = 6 }: ToolbarPlacementInputs): ToolbarPlacement {
    const above = anchor.top - gap - size.height;
    const below = anchor.top + anchor.height + gap;
    const fitsAbove = above >= bounds.top;
    const fitsBelow = below + size.height <= bounds.top + bounds.height;

    const side: ToolbarSide = prefer === 'above' ? (fitsAbove || !fitsBelow ? 'above' : 'below') : (fitsBelow || !fitsAbove ? 'below' : 'above');
    const wanted = side === 'above' ? above : below;
    const top = Math.max(bounds.top, Math.min(wanted, bounds.top + bounds.height - size.height));

    // Left-aligned with the item; a toolbar wider than the room to the right is pushed back from the right edge, and never left of the surface.
    const left = Math.max(bounds.left, Math.min(anchor.left, bounds.left + bounds.width - size.width));
    return { left, top, side };
}
