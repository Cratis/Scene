// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ViewportPreset } from './ViewportPreset';
import type { ViewportSize } from './ViewportSize';

// The height of the window's title bar. The designed screen's viewport is the window minus this.
export const windowChromeHeight = 40;

// The surface size each preset asks for. The presets only choose a starting size: layout is evaluated against the
// window's actual viewport afterwards, the same as when the window is resized by hand, so there is no separate
// "mobile mode" with rules of its own.
//
// Desktop is 1280 x 720, chosen for what fits rather than for what exists. A browser's page is its screen minus the tab strip, address bar and
// dock, and the window needs a margin and a title bar around the screen it designs. StatCounter's desktop resolutions for September 2026 are
// 1920x1080 (28%), 1536x864 (10%), 1366x768 (8%) and 1280x720 (5%). 1280 wide is the widest desktop layout that still opens at full width on
// every display from 1366 across up - the large majority of those - and 720 is the 16:9 height that opens whole on a 1080p display, where the
// earlier 1280 x 800 did not leave room on an 864-high laptop. On a smaller page the window takes the room there is rather than being cut off.
// 1280 is also Tailwind's `xl` breakpoint and the width of the MacBook Air frame among Figma's Desktop presets (whose default Desktop frame is 1440 x 1024).
export const viewportPresetSizes: Record<ViewportPreset, ViewportSize> = {
    [ViewportPreset.Desktop]: { width: 1280, height: 720 },
    [ViewportPreset.Mobile]: { width: 390, height: 844 },
};
