// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** How a preview of a given size is shown in the room the stage has: shrunk to fit, never enlarged past its own size, so a text stays as sharp as it is. */
export interface StageFit {
    /** The factor the preview is scaled by, 1 or less. */
    scale: number;

    /** The room the scaled preview takes. */
    width: number;
    height: number;
}

/**
 * Fits a preview into the room the stage has. The preview keeps its own layout width - a phone is 390 wide whatever the stage - and is scaled down
 * to fit; the room it needs is the scaled size, so the stage can centre it.
 *
 * @param preview The preview's own size, in layout pixels.
 * @param room The room the stage has, in screen pixels.
 * @param margin The space to leave around the preview, in screen pixels.
 * @returns The scale and the scaled size.
 */
export function fitToStage(preview: { width: number; height: number }, room: { width: number; height: number }, margin = 24): StageFit {
    const availableWidth = Math.max(room.width - margin * 2, 1);
    const availableHeight = Math.max(room.height - margin * 2, 1);
    const scale = Math.min(1, availableWidth / preview.width, availableHeight / preview.height);
    return { scale, width: Math.round(preview.width * scale), height: Math.round(preview.height * scale) };
}

/**
 * Where a region the preview measured is on the stage: the preview's own pixels, scaled and moved to where the frame sits.
 *
 * @param rect The region, in the preview's own pixels.
 * @param fit The fit the preview is shown at.
 * @returns The region in the frame's own screen pixels, for an outline drawn over the frame.
 */
export function regionOnStage(rect: { x: number; y: number; width: number; height: number }, fit: StageFit): { left: number; top: number; width: number; height: number } {
    return { left: rect.x * fit.scale, top: rect.y * fit.scale, width: rect.width * fit.scale, height: rect.height * fit.scale };
}
