// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A rectangle in viewport coordinates. */
export interface PanelRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

/** The size of the viewport. */
export interface PanelBounds {
    width: number;
    height: number;
}

/** Where a panel is fixed, in viewport coordinates. */
export interface PanelPosition {
    top: number;
    left: number;
}

const margin = 8;
const gap = 4;

/**
 * Places the first panel of a menu under (or, with no room, over) the control that opened it, aligned to its left
 * edge, and keeps it inside the viewport.
 *
 * @param anchor The control's rectangle.
 * @param size The panel's size once laid out.
 * @param bounds The viewport.
 * @returns The position.
 */
export function placePanelBelow(anchor: PanelRect, size: Pick<PanelRect, 'width' | 'height'>, bounds: PanelBounds): PanelPosition {
    const left = Math.max(margin, Math.min(anchor.left, bounds.width - size.width - margin));
    const below = anchor.top + anchor.height + gap;
    const fitsBelow = below + size.height <= bounds.height - margin;
    return { left, top: fitsBelow ? below : Math.max(margin, anchor.top - size.height - gap) };
}

/**
 * Places a submenu panel beside the row that opened it: to the right when there is room, otherwise to the left, with
 * its top level with the row and pulled up when it would run off the bottom.
 *
 * @param row The row's rectangle.
 * @param size The panel's size once laid out.
 * @param bounds The viewport.
 * @returns The position.
 */
export function placePanelBeside(row: PanelRect, size: Pick<PanelRect, 'width' | 'height'>, bounds: PanelBounds): PanelPosition {
    const right = row.left + row.width + gap;
    const left = right + size.width <= bounds.width - margin ? right : Math.max(margin, row.left - size.width - gap);
    const top = Math.max(margin, Math.min(row.top - 4, bounds.height - size.height - margin));
    return { left, top };
}
