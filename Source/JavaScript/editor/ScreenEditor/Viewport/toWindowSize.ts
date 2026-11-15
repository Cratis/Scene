// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { windowChromeHeight } from './viewportPresets';
import type { ViewportSize } from './ViewportSize';

// The window size that gives the designed screen the requested viewport, shrunk to fit what the display has room for.
export function toWindowSize(viewport: ViewportSize, available: ViewportSize): ViewportSize {
    return {
        width: Math.min(viewport.width, available.width),
        height: Math.min(viewport.height + windowChromeHeight, available.height),
    };
}

// The viewport the designed screen actually lays out against, given the window's size.
export function toViewport(windowSize: ViewportSize): ViewportSize {
    return { width: windowSize.width, height: Math.max(0, windowSize.height - windowChromeHeight) };
}
