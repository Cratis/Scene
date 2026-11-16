// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';
import { canvasLeft, canvasTop } from '../PrototypeProjection/legacyPlacement';

// Where an element goes on a canvas, in the canvas's own pixels.
export interface CanvasPlacement {
    left: number;
    top: number;
}

const canvasMargin = 16;

// The gap left between an element added without a position and the lowest one already there.
export const canvasGap = 16;

// What an element on a canvas is assumed to be tall when its size is not known (the surface has not measured it): a control's usual height.
export const nominalElementHeight = 40;

// What is known of an element already on a canvas, for placing the next one.
export interface PlacedBox {
    placement?: CanvasPlacement;

    // Its measured height in the canvas's pixels, if it has been drawn and measured.
    height?: number;

    // Where its lower edge was measured, in the canvas's pixels from the canvas's own top, if it has been drawn and measured. This is the truth about
    // an element in flow, which sits wherever the flow put it, and about one whose position the canvas has moved.
    bottom?: number;
}

// The position of the next element added to a canvas without a drop point: at the left margin, below the lowest element already there, with a
// gap, so it never lands on one - whatever the sizes of the others, measured where they have been. An element that is in flow (no position) is
// drawn one after another from the canvas's corner, so where it is not measured the flow's own height stands in for it. An empty canvas gets the
// corner, inside the margin.
export function placementBelow(existing: readonly PlacedBox[]): CanvasPlacement {
    if (existing.length === 0) return { left: canvasMargin, top: canvasMargin };
    let flowBottom = 0;
    const bottoms = existing.map(box => {
        if (box.bottom !== undefined) return box.bottom;
        if (box.placement) return box.placement.top + (box.height ?? nominalElementHeight);
        flowBottom += box.height ?? nominalElementHeight;
        return flowBottom;
    });
    return { left: canvasMargin, top: Math.max(...bottoms) + canvasGap };
}

// The element with its canvas position set, leaving the rest of it alone. A canvas draws a child at its position, or - with none - in
// flow at the corner, on top of whatever else has none; a position is what makes an element added to a canvas land where it was put.
export function placeOnCanvas<T extends SceneElement>(element: T, placement: CanvasPlacement): T {
    const properties = (element as { properties?: Record<string, unknown> }).properties ?? {};
    return { ...element, properties: { ...properties, [canvasLeft]: Math.max(0, Math.round(placement.left)), [canvasTop]: Math.max(0, Math.round(placement.top)) } } as T;
}

// The position an element has on a canvas, if it has one.
export function placementOf(element: SceneElement): CanvasPlacement | undefined {
    const properties = (element as { properties?: Record<string, unknown> }).properties ?? {};
    const left = properties[canvasLeft];
    const top = properties[canvasTop];
    return typeof left === 'number' && typeof top === 'number' ? { left, top } : undefined;
}

// The element with its canvas position taken off. An element that leaves a canvas keeps nothing of where it sat there: the position
// means nothing in a flow layout, and would be saved and shown under Placement.
export function removePlacement<T extends SceneElement>(element: T): T {
    const { [canvasLeft]: _left, [canvasTop]: _top, ...rest } = (element as { properties?: Record<string, unknown> }).properties ?? {};
    return { ...element, properties: rest } as T;
}
