// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, type RefObject } from 'react';
import type { ElementMeasurer } from '../Host/ScreenEditorController';
import { elementRect, inSurfacePixels, surfaceOrigin } from './elementRect';

const hasArea = (box: DOMRect | undefined): box is DOMRect => !!box && box.width > 0 && box.height > 0;

const measureIn = (root: HTMLElement, id: string): ReturnType<ElementMeasurer> => {
    const origin = surfaceOrigin(root);
    // An element placed on a canvas occupies the box the canvas gives it, margins its component draws included, so that box is what the next
    // one must clear; anything else is measured by what it draws.
    const placed = root.querySelector(`[data-studio-element="${CSS.escape(id)}"]`)?.closest('[data-scene-placement]');
    const box = placed?.getBoundingClientRect();
    if (hasArea(box)) return inSurfacePixels(box, origin);
    const rect = elementRect(root, id, origin);
    return rect && { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
};

// Lets the controller measure what the surface draws, so what is added to a canvas without a drop point is placed below what is already there.
export const useSurfaceMeasurer = (surface: RefObject<HTMLDivElement | null>, setMeasurer: (measure: ElementMeasurer | undefined) => void): void => {
    useEffect(() => {
        setMeasurer(id => {
            const root = surface.current;
            return root ? measureIn(root, id) : undefined;
        });
        return () => setMeasurer(undefined);
    }, [surface, setMeasurer]);
};
