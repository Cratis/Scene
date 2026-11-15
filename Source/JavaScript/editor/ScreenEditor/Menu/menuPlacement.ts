// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export interface MenuRectangle {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface MenuPlacementRequest {
    trigger: MenuRectangle;

    // What the menu asks for: its own width, and the height all of its content would take.
    content: { width: number; height: number };
    viewport: { width: number; height: number };

    // The space kept between the button and the menu, and between the menu and the edge of the window.
    gap: number;
    margin: number;
}

export interface MenuPlacement {
    side: 'below' | 'above';
    left: number;
    top: number;
    width: number;
    height: number;
}

// Where a menu opens from its button: straight below it when the content fits there, above it when it fits there instead, and otherwise on the side with the
// most room, with the height cut to that room so the menu scrolls inside itself. It starts at the button's own edge and is shifted back into the window sideways,
// so no part of it is ever outside the window.
export const placeMenu = ({ trigger, content, viewport, gap, margin }: MenuPlacementRequest): MenuPlacement => {
    const roomBelow = Math.max(0, viewport.height - margin - trigger.bottom - gap);
    const roomAbove = Math.max(0, trigger.top - margin - gap);
    const fitsBelow = content.height <= roomBelow;
    const fitsAbove = content.height <= roomAbove;
    const side = fitsBelow || (!fitsAbove && roomBelow >= roomAbove) ? 'below' : 'above';
    const room = side === 'below' ? roomBelow : roomAbove;

    const width = Math.min(content.width, Math.max(0, viewport.width - margin * 2));
    const height = Math.min(content.height, room);
    const maximumLeft = Math.max(margin, viewport.width - margin - width);
    const left = Math.min(Math.max(trigger.left, margin), maximumLeft);
    const top = side === 'below' ? trigger.bottom + gap : trigger.top - gap - height;

    return { side, left, top, width, height };
};
