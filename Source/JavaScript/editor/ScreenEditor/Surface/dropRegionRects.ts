// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DropRegion } from '../DropRegions/DropRegion';
import { DropRegionKind } from '../DropRegions/DropRegionKind';
import { InsertionAxis } from '../DropRegions/InsertionAxis';

export interface Rect { left: number; top: number; width: number; height: number }

// Finds where an element is drawn, relative to the surface. The surface supplies it from the rendered tree.
export type RectOf = (elementId: string) => Rect | undefined;

export interface PlacedRegion {
    region: DropRegion;
    rect: Rect;
}

const marker = 3;

// Where a drop region is drawn. The regions come from the model; only here are they given a place on screen, by asking
// where the container and its siblings were rendered. An empty container has nothing inside it to hang a marker on, so
// its whole body is the target. Between two siblings the marker sits in the gap; before the first or after the last it
// sits against the outer edge.
export function placeRegion(region: DropRegion, surface: Rect, rectOf: RectOf): Rect | undefined {
    const container = region.containerId === null ? surface : rectOf(region.containerId);
    if (!container) return undefined;

    if (region.kind === DropRegionKind.Container) return container;

    const after = region.afterId ? rectOf(region.afterId) : undefined;
    const before = region.beforeId ? rectOf(region.beforeId) : undefined;

    if (region.axis === InsertionAxis.Horizontal) {
        const top = after ? after.top + after.height : before ? before.top - marker : container.top;
        return { left: container.left, top: top - marker / 2, width: container.width, height: marker };
    }

    if (region.axis === InsertionAxis.Vertical) {
        const left = after ? after.left + after.width : before ? before.left - marker : container.left;
        return { left: left - marker / 2, top: container.top, width: marker, height: container.height };
    }

    return undefined;
}
