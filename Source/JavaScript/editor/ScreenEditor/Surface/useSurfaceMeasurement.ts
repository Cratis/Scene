// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { DropRegion } from '../DropRegions/DropRegion';
import { elementRect, surfaceOrigin } from './elementRect';
import { placeRegion, type PlacedRegion, type Rect } from './dropRegionRects';
import { sameRegions, sameSelection } from './sameMeasurement';

export interface SurfaceMeasurement {
    placed: PlacedRegion[];
    selectionRect: Rect | undefined;

    // The regions as they are now, for a drag that must not decide from the last render's measurement.
    measureNow: () => PlacedRegion[];
}

// Where the screen drew each element, relative to the surface. An element that drew nothing is found by the note that stands in
// for it, so it still has a place to outline and to drop beside.
export function useSurfaceMeasurement(surface: RefObject<HTMLDivElement | null>, dropRegions: readonly DropRegion[], selectedId: string | undefined): SurfaceMeasurement {
    const [placed, setPlaced] = useState<PlacedRegion[]>([]);
    const [selectionRect, setSelectionRect] = useState<Rect>();
    const latest = useRef<PlacedRegion[]>([]);

    const measureNow = useCallback((): PlacedRegion[] => {
        const root = surface.current;
        if (!root) return [];
        const origin = surfaceOrigin(root);
        const rectOf = (id: string): Rect | undefined => elementRect(root, id, origin);

        const whole: Rect = { left: 0, top: 0, width: origin.width, height: origin.height };
        return dropRegions.flatMap(region => {
            const rect = placeRegion(region, whole, rectOf);
            return rect ? [{ region, rect }] : [];
        });
    }, [surface, dropRegions]);

    const measure = useCallback(() => {
        const root = surface.current;
        if (!root) return;
        const regions = measureNow();
        latest.current = regions;

        // Only a measurement that differs from the last may set state: this runs after every render.
        setPlaced(previous => sameRegions(previous, regions) ? previous : regions);
        const selected = selectedId ? elementRect(root, selectedId, surfaceOrigin(root)) : undefined;
        setSelectionRect(previous => sameSelection(previous, selected) ? previous : selected);
    }, [surface, measureNow, selectedId]);

    // The regions are positioned from what was just rendered, so they are measured after every render.
    useLayoutEffect(() => { measure(); });
    useLayoutEffect(() => {
        const root = surface.current;
        if (!root || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(root);
        return () => observer.disconnect();
    }, [surface, measure]);

    // A component may draw a moment after the render that placed it - a note standing in for one that has nothing to show appears once it
    // is known that it has nothing - so what the surface holds changing is a reason to measure, not only a render of the surface itself.
    // Without it an element selected before its note appeared would have no outline until something else caused a render.
    useLayoutEffect(() => {
        const root = surface.current;
        if (!root || typeof MutationObserver === 'undefined') return;
        let frame = 0;
        const observer = new MutationObserver(() => {
            if (frame !== 0) return;
            frame = requestAnimationFrame(() => { frame = 0; measure(); });
        });
        observer.observe(root, { childList: true, subtree: true });
        return () => { observer.disconnect(); if (frame !== 0) cancelAnimationFrame(frame); };
    }, [surface, measure]);

    return { placed, selectionRect, measureNow };
}
