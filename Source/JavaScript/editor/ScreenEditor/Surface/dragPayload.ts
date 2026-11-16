// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DragEvent } from 'react';
import { isPalettePayload, type PalettePayload } from '../Palette/PaletteEntry';

// The media type a palette item travels under while it is dragged over the surface.
export const paletteMediaType = 'application/x-studio-palette-item';
// The media type an element being moved on the surface travels under.
export const elementMediaType = 'application/x-studio-element';

// A small card that follows the pointer while something is dragged, so what is being carried is always visible: the browser's own image of
// a toolbar tile is cropped to the tile and nothing at all for an element on the surface. It is drawn off screen for the instant the
// browser takes its picture, and removed straight after.
export function setDragPreview(event: Pick<DragEvent, 'dataTransfer'>, label: string, icon?: Element | null): void {
    const card = document.createElement('div');
    card.className = 'studio-drag-preview';
    if (icon) card.append(icon.cloneNode(true));
    card.append(Object.assign(document.createElement('span'), { textContent: label }));
    document.body.append(card);
    event.dataTransfer.setDragImage(card, 14, 14);
    setTimeout(() => card.remove(), 0);
}

export const setPaletteDrag = (event: DragEvent, payload: PalettePayload, label?: string): void => {
    event.dataTransfer.setData(paletteMediaType, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'copyMove';
    if (label) setDragPreview(event, label, event.currentTarget instanceof Element ? event.currentTarget.querySelector('svg') : null);
};

export const setElementDrag = (event: DragEvent, elementId: string, label: string): void => {
    event.dataTransfer.setData(elementMediaType, elementId);
    event.dataTransfer.effectAllowed = 'move';
    setDragPreview(event, label);
};

export const readElementDrag = (event: Pick<DragEvent, 'dataTransfer'>): string | undefined => event.dataTransfer.getData(elementMediaType) || undefined;

export const isElementDrag = (event: Pick<DragEvent, 'dataTransfer'>): boolean => event.dataTransfer.types.includes(elementMediaType);

// Anything the surface accepts: a new item from the toolbar, or an element already on the screen.
export const isSurfaceDrag = (event: Pick<DragEvent, 'dataTransfer'>): boolean => isPaletteDrag(event) || isElementDrag(event);

export function readPaletteDrag(event: Pick<DragEvent, 'dataTransfer'>): PalettePayload | undefined {
    try {
        const parsed = JSON.parse(event.dataTransfer.getData(paletteMediaType));
        return isPalettePayload(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export const isPaletteDrag = (event: Pick<DragEvent, 'dataTransfer'>): boolean => event.dataTransfer.types.includes(paletteMediaType);
