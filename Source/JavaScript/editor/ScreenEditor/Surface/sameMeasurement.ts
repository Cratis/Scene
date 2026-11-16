// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PlacedRegion, Rect } from './dropRegionRects';

const sameRect = (left: Rect | undefined, right: Rect | undefined): boolean =>
    left === right || (!!left && !!right && left.left === right.left && left.top === right.top && left.width === right.width && left.height === right.height);

// Whether two measurements of the surface agree. The surface measures after every render, and a measurement that sets
// state would render again and measure again without end; only a measurement that differs from the last may set it.
export const sameRegions = (left: readonly PlacedRegion[], right: readonly PlacedRegion[]): boolean =>
    left.length === right.length && left.every((placed, index) => placed.region.id === right[index].region.id && sameRect(placed.rect, right[index].rect));

export const sameSelection = sameRect;
