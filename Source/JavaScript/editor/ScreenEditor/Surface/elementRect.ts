// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Rect } from './dropRegionRects';

// Where the surface is on the page, and how much the page scales it: left/top are viewport pixels, width/height the surface's own layout pixels, and the scale is
// what a CSS transform on the surface or an ancestor - the board's zoom - applies to them. Everything placed *inside* the surface is written in its own
// pixels, so a box measured on the page (viewport pixels) must be divided by the scale first, or it is scaled a second time when it is drawn.
export interface SurfaceOrigin {
    left: number;
    top: number;
    width: number;
    height: number;
    scaleX?: number;
    scaleY?: number;
}

const scaleOf = (drawn: number, layout: number): number => {
    if (!(layout > 0) || !(drawn > 0)) return 1;
    const scale = drawn / layout;
    return Math.abs(scale - 1) < 0.004 ? 1 : scale;
};

/** The origin of a surface: its place on the page, its own size and the scale the page applies to it. */
export function surfaceOrigin(root: HTMLElement): SurfaceOrigin {
    const box = root.getBoundingClientRect();
    const scaleX = scaleOf(box.width, root.offsetWidth);
    const scaleY = scaleOf(box.height, root.offsetHeight);
    return { left: box.left, top: box.top, width: scaleX === 1 ? box.width : root.offsetWidth, height: scaleY === 1 ? box.height : root.offsetHeight, scaleX, scaleY };
}

/** A box on the page, in the surface's own pixels. */
export function inSurfacePixels(box: { left: number; top: number; width: number; height: number }, origin: SurfaceOrigin): Rect {
    const scaleX = origin.scaleX ?? 1;
    const scaleY = origin.scaleY ?? 1;
    return { left: (box.left - origin.left) / scaleX, top: (box.top - origin.top) / scaleY, width: box.width / scaleX, height: box.height / scaleY };
}

const isDrawn = (rect: DOMRect): boolean => rect.width > 0 && rect.height > 0;

// The boxes a node puts on the page: itself when it has one, otherwise - a wrapper drawn as `display: contents` - those of what it holds.
function boxesOf(node: Element): DOMRect[] {
    const own = node.getBoundingClientRect();
    if (isDrawn(own)) return [own];
    return Array.from(node.children).flatMap(boxesOf);
}

// Where an element is on the surface, as one rectangle: the area its component draws, or the note standing in for it. A component is not
// required to mark its own root with the element's id, so the wrapper the surface draws it in is what is measured first.
export function elementRect(surface: Element, elementId: string, origin: SurfaceOrigin): Rect | undefined {
    const escaped = CSS.escape(elementId);
    const candidates = [
        ...Array.from(surface.querySelectorAll(`[data-studio-element="${escaped}"]`)),
        ...Array.from(surface.querySelectorAll(`[data-scene-id="${escaped}"]`)),
    ];

    for (const candidate of candidates) {
        const rect = nodeRect(candidate, origin);
        if (rect) return rect;
    }

    return undefined;
}

// Where a node is on the surface, as one rectangle: the union of the boxes it draws, which is how a `display: contents` wrapper is measured.
export function nodeRect(node: Element, origin: SurfaceOrigin): Rect | undefined {
    const boxes = boxesOf(node);
    if (boxes.length === 0) return undefined;

    const left = Math.min(...boxes.map(box => box.left));
    const top = Math.min(...boxes.map(box => box.top));
    const right = Math.max(...boxes.map(box => box.right));
    const bottom = Math.max(...boxes.map(box => box.bottom));
    return inSurfacePixels({ left, top, width: right - left, height: bottom - top }, origin);
}
