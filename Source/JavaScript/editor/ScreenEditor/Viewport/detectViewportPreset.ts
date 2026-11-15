// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { viewportPresetSizes } from './viewportPresets';
import { ViewportPreset } from './ViewportPreset';
import { toWindowSize } from './toWindowSize';
import type { ViewportSize } from './ViewportSize';

// Which preset the window currently matches, or undefined when it has been resized to something in between.
// A preset that had to be shrunk to fit the display still counts as matching - it is the size it would be given again.
export function detectViewportPreset(windowSize: ViewportSize, available: ViewportSize): ViewportPreset | undefined {
    return Object.values(ViewportPreset).find(preset => {
        const expected = toWindowSize(viewportPresetSizes[preset], available);
        return expected.width === windowSize.width && expected.height === windowSize.height;
    });
}
