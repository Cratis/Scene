// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export interface OverlayViewport {
    width: number;
    height: number;
}

export interface FittedOverlay {
    // What the window is drawn at: never more than the display has room for.
    width: number;
    height: number;

    // How far its centre sits from the display's centre; the window never leaves the display.
    offsetX: number;
}

// The space kept clear around the window on every side of the display.
export const overlayMargin = 8;

// Fits the floating window into the display. The size a person chose or saved belongs to the screen; what is drawn is the most of it that
// fits, so the window - and the controls on its title bar - can always be reached, whatever the size of the display or of the inspector
// beside it. The window is centred, shifted by what the host and the inspector ask for, and shifted back by as much as keeps it inside.
export function fitOverlay(size: { width: number; height: number }, viewport: OverlayViewport, requestedOffsetX: number): FittedOverlay {
    const width = Math.max(1, Math.min(size.width, viewport.width - overlayMargin * 2));
    const height = Math.max(1, Math.min(size.height, viewport.height - overlayMargin * 2));
    const furthest = Math.max(0, (viewport.width - width) / 2 - overlayMargin);
    return { width, height, offsetX: Math.min(furthest, Math.max(-furthest, requestedOffsetX)) };
}
