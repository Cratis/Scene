// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { computeSizeClass } from '@cratis/scene.engine';
import type { SizeClass } from '@cratis/scene.model';
import { toViewport } from './toWindowSize';
import type { ViewportSize } from './ViewportSize';

// The size class Scene evaluates for a window of this size. It is Scene's own computation with Scene's own
// breakpoints - the editor adds no breakpoints of its own, so the class shown while designing is the class Play will
// pick for the same viewport.
export function resolveViewportSizeClass(windowSize: ViewportSize): SizeClass {
    const viewport = toViewport(windowSize);
    return computeSizeClass(viewport.width, viewport.height);
}
