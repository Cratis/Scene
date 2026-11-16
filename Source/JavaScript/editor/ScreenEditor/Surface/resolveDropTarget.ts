// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../DropRegions/DropRegionKind';
import { InsertionAxis } from '../DropRegions/InsertionAxis';
import type { PlacedRegion, Rect } from './dropRegionRects';

// Where a drag would land if it were released now: the region that receives it, and the container it lands in.
export interface ResolvedDrop {
    target: PlacedRegion;

    // The container that receives the drop. Drawn around the insertion marker so it is clear which one it is.
    container: Rect;
}

const area = ({ width, height }: Rect): number => width * height;

const contains = (rect: Rect, x: number, y: number): boolean =>
    x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;

// The band along a container's border is at most a quarter of the container, so a small container still has an inside.
const nearEdge = (rect: Rect, x: number, y: number, edge: number): boolean => {
    const horizontal = Math.min(edge, rect.width / 4);
    const vertical = Math.min(edge, rect.height / 4);
    return x - rect.left < horizontal || rect.left + rect.width - x < horizontal || y - rect.top < vertical || rect.top + rect.height - y < vertical;
};

// How far the pointer is from a marker, measured across the way the marker runs: a horizontal line is reached by moving
// up or down, a vertical bar by moving left or right.
const distanceTo = ({ region, rect }: PlacedRegion, x: number, y: number): number =>
    region.axis === InsertionAxis.Vertical
        ? Math.abs(x - (rect.left + rect.width / 2))
        : Math.abs(y - (rect.top + rect.height / 2));

// Decides where a drop lands. The pointer is always somewhere on the surface, so there is always an answer when the screen
// can be dropped on at all: it is the innermost container under the pointer - or, when the pointer is outside every container,
// the outermost one, so the empty part of the screen drops at the end of it. Within a container that holds children the drop
// goes to the marker nearest the pointer, not to a marker the pointer has to hit exactly. A pointer on the very edge of a
// container belongs to the container around it, which is how something is dropped beside a container rather than into it.
export function resolveDropTarget(regions: readonly PlacedRegion[], x: number, y: number, edge = 6): ResolvedDrop | undefined {
    const containers = regions.filter(placed => placed.region.kind === DropRegionKind.Container);
    if (containers.length === 0) return undefined;

    // Regions are listed outside in, so of two containers drawn the same size - one wrapping only the other - the later is the inner.
    const under = containers
        .map((placed, order) => ({ placed, order }))
        .filter(({ placed }) => contains(placed.rect, x, y))
        .sort((left, right) => area(left.placed.rect) - area(right.placed.rect) || right.order - left.order)
        .map(({ placed }) => placed);
    const inner = under[0];
    const chosen = inner && under.length > 1 && nearEdge(inner.rect, x, y, edge)
        ? under[1]
        : inner ?? [...containers].sort((left, right) => area(right.rect) - area(left.rect))[0];

    const markers = regions.filter(placed =>
        placed.region.kind === DropRegionKind.Between && placed.region.containerId === chosen.region.containerId);

    if (chosen.region.isEmptyContainer || markers.length === 0) return { target: chosen, container: chosen.rect };

    const nearest = markers.reduce((best, candidate) => distanceTo(candidate, x, y) < distanceTo(best, x, y) ? candidate : best);
    return { target: nearest, container: chosen.rect };
}
