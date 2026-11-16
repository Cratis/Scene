// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toWindowSize } from './toWindowSize';
import { viewportPresetSizes } from './viewportPresets';
import { ViewportPreset } from './ViewportPreset';
import type { ViewportSize } from './ViewportSize';

// The window every screen was opened at before the editor chose a size of its own. A screen saved at exactly this size was never resized by a
// person - the size was written down because it was the first one - so it is not a choice to honor.
const legacyDefaultWindow: ViewportSize = { width: 900, height: 640 };

const isUsable = (size: ViewportSize | undefined): size is ViewportSize =>
    !!size && Number.isFinite(size.width) && Number.isFinite(size.height) && size.width > 0 && size.height > 0;

// The window a screen opens at when nothing says otherwise: the desktop preview at full size, or as much of it as the display has room for.
export function defaultWindowSize(available: ViewportSize): ViewportSize {
    return toWindowSize(viewportPresetSizes[ViewportPreset.Desktop], available);
}

export function isLegacyDefaultWindow(size: ViewportSize | undefined): boolean {
    return !!size && size.width === legacyDefaultWindow.width && size.height === legacyDefaultWindow.height;
}

// What is known about the size of the window when a screen is opened, most specific first.
export interface WindowSizeCandidates {
    // The size this person left this screen's window at, on this browser.
    remembered?: ViewportSize;

    // The size saved with the screen where it lives (the board's record of it), shared by everyone who opens it.
    saved?: ViewportSize;

    // The size this person last left any window at, on this browser.
    lastUsed?: ViewportSize;
}

// The size the window opens at, always inside the room the display has: this person's own size for this screen, else the screen's saved size,
// else the size they last used for any screen, else the desktop preview. A size that does not fit is fitted rather than refused, so a window
// left large on a big display opens whole on a small one. A saved size that is only the old default is treated as none.
export function resolveInitialWindowSize(candidates: WindowSizeCandidates, available: ViewportSize): ViewportSize {
    const saved = isLegacyDefaultWindow(candidates.saved) ? undefined : candidates.saved;
    const chosen = [candidates.remembered, saved, candidates.lastUsed].find(isUsable) ?? defaultWindowSize(available);
    return fitWindowSize(chosen, available);
}

// The window made to fit the room the display has, keeping what already fits.
export function fitWindowSize(size: ViewportSize, available: ViewportSize): ViewportSize {
    return { width: Math.round(Math.min(size.width, available.width)), height: Math.round(Math.min(size.height, available.height)) };
}
