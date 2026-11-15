// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { windowChromeHeight } from '../Viewport/viewportPresets';
import { defaultWindowSize } from '../Viewport/windowSizing';
import type { ViewportSize } from '../Viewport/ViewportSize';

// The size the screen is drawn at before it is scaled down: the viewport the window had, which is the window less its title bar. A screen that was
// never given a window size is drawn at the desktop preview, the size a new window opens at.
export interface ThumbnailGeometry {
    // The size the screen is laid out at.
    canvasWidth: number;
    canvasHeight: number;

    // The size it is shown at.
    width: number;
    bodyHeight: number;
    scale: number;
}

// How wide the board's miniature is, and how tall its screen may be. A miniature of a real screen is read for what is on it - which components,
// roughly where, in what colors - so it is drawn larger than the earlier one of boxes (150), as large as a row of the board has room for.
export const thumbnailWidth = 240;
export const thumbnailMaxBodyHeight = 112;

export function thumbnailGeometry(windowSize: ViewportSize | undefined, width = thumbnailWidth, maxBodyHeight = Number.POSITIVE_INFINITY): ThumbnailGeometry {
    const window = windowSize && windowSize.width > 0 && windowSize.height > 0 ? windowSize : defaultWindowSize({ width: Infinity, height: Infinity });
    const canvasWidth = window.width;
    const canvasHeight = Math.max(1, window.height - windowChromeHeight);
    // A window much taller than it is wide (a phone) is scaled to the height there is room for instead, and is narrower than asked.
    const scale = Math.min(width / canvasWidth, maxBodyHeight / canvasHeight);
    return { canvasWidth, canvasHeight, width: Math.round(canvasWidth * scale), bodyHeight: Math.round(canvasHeight * scale), scale };
}
