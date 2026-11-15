// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplatePreviewSize } from '../ScreenEditor/Templates/TemplatePreviewSize';

/** How a template is laid out and shown: the window it is laid out in, and what it is scaled by to fit the room there is. */
export interface TemplatePreviewGeometry {
    /** The size the template is laid out at, as a window of the device chosen: the viewport it would have there. */
    designWidth: number;
    designHeight: number;

    /** What the layout is scaled by. */
    scale: number;

    /** The size it is shown at, which keeps the shape of the window it is laid out in. */
    width: number;
    height: number;
}

/** The tallest a preview of a portrait device may be shown, so a phone is not drawn taller than the dialog it is in. */
export const maxPreviewHeight = 460;

const designSizeOf = (size: TemplatePreviewSize): { width: number; height: number } => {
    switch (size) {
        case TemplatePreviewSize.Phone: return { width: 390, height: 844 };
        case TemplatePreviewSize.Tablet: return { width: 768, height: 1024 };
        default: return { width: 1280, height: 720 };
    }
};

/**
 * Works out how a template is shown in a pane: laid out at the size of the device chosen and scaled to fit the pane's width - and, for a device
 * taller than it is wide, the height there is room for - with the shape of that device kept, as a browser's device mode does.
 * @param size The device chosen.
 * @param availableWidth The width of the pane; nothing is known of it before it is measured, and the preview is drawn at a guess meanwhile.
 * @returns The geometry.
 */
export function templatePreviewGeometry(size: TemplatePreviewSize, availableWidth: number): TemplatePreviewGeometry {
    const { width: designWidth, height: designHeight } = designSizeOf(size);
    const room = availableWidth > 0 ? availableWidth : designWidth / 4;
    const scale = Math.min(room / designWidth, maxPreviewHeight / designHeight);
    return { designWidth, designHeight, scale, width: Math.round(designWidth * scale), height: Math.round(designHeight * scale) };
}
