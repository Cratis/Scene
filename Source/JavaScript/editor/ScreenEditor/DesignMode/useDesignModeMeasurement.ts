// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { elementRect, nodeRect, surfaceOrigin, type SurfaceOrigin } from '../Surface/elementRect';
import type { Rect } from '../Surface/dropRegionRects';
import type { DesignModeSubject } from './designModeTypes';
import { keepWatching, type Watching } from './keepWatching';
import { whenTransitionsEnd } from './whenTransitionsEnd';

export interface DesignModeMeasurement {

    // The surface and the design-mode component, and the items it drew, each as the surface's own pixels.
    surface: Rect;
    component: Rect | undefined;
    items: Readonly<Record<string, Rect>>;
}

// How an item is found among what the component drew. Elements are drawn under their own id, like any element; the rows of a collection, the
// items of a navigation region and the items of an outlet carry the id of the item (`data-scene-item`, `data-scene-nav-item`,
// `data-scene-outlet-item`), and a region's link is the part that has the
// box of the item - the item itself also holds its sub-items.
const itemSelectors = (id: string): string[] => {
    const escaped = CSS.escape(id);
    return [`[data-scene-nav-item="${escaped}"] > [data-scene-nav-link]`, `[data-scene-nav-item="${escaped}"]`, `[data-scene-item="${escaped}"]`, `[data-scene-outlet-item="${escaped}"]`];
};

const same = (a: Rect | undefined, b: Rect | undefined) => a === b || (!!a && !!b && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height);
const sameMeasurement = (a: DesignModeMeasurement, b: DesignModeMeasurement) =>
    same(a.surface, b.surface) && same(a.component, b.component)
    && Object.keys(b.items).length === Object.keys(a.items).length && Object.entries(b.items).every(([id, rect]) => same(a.items[id], rect));

// Calls `changed` (once per frame) whenever the surface, the composition it draws or what the surface holds changes.
function watchSurface(root: HTMLDivElement, changed: () => void): () => void {
    const observers: { disconnect: () => void }[] = [];
    let frame = 0;
    const later = () => { if (frame === 0) frame = requestAnimationFrame(() => { frame = 0; changed(); }); };
    if (typeof ResizeObserver !== 'undefined') {
        const resize = new ResizeObserver(later);
        resize.observe(root);
        observers.push(resize);

        // The composition the surface draws takes the size its stylesheet gives it when that has loaded, which changes no attribute and not the surface's own size,
        // so a frame measured before then stays the size of what it held at the time (the slot's outline was the size of a title). Its own size is watched too.
        const composition = new ResizeObserver(later);
        const watchComposition = () => { composition.disconnect(); root.querySelectorAll('[data-scene-id="composition"]').forEach(element => composition.observe(element)); };
        watchComposition();
        observers.push(composition);
        if (typeof MutationObserver !== 'undefined') { const arrival = new MutationObserver(watchComposition); arrival.observe(root, { childList: true, subtree: true }); observers.push(arrival); }
    }
    if (typeof MutationObserver !== 'undefined') { const mutation = new MutationObserver(later); mutation.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] }); observers.push(mutation); }
    // A window that opens by scaling up changes every box on the surface's page without changing any of their sizes: measure again when that ends.
    const stopTransitions = whenTransitionsEnd(root.ownerDocument, later);
    return () => { observers.forEach(observer => observer.disconnect()); stopTransitions(); if (frame !== 0) cancelAnimationFrame(frame); };
}

// Measures something drawn on the surface after every render and whenever the surface or what it holds changes - the chrome is placed from what was
// just drawn, not from what the model says. `compute` reads the DOM; `same` says whether two readings are the same, so an unchanged one renders nothing.
export function useSurfaceMeasured<T>(surface: RefObject<HTMLDivElement | null>, compute: (root: HTMLDivElement, origin: SurfaceOrigin) => T | undefined, same: (a: T, b: T) => boolean): T | undefined {
    const [measured, setMeasured] = useState<T>();

    const measure = useCallback(() => {
        const root = surface.current;
        const next = root ? compute(root, surfaceOrigin(root)) : undefined;
        setMeasured(previous => previous === undefined || next === undefined ? next : same(previous, next) ? previous : next);
    }, [surface, compute, same]);

    // What watches the surface is attached to the element once it exists. A chrome drawn inside the surface runs its first layout effect before the surface's
    // own ref is set, so an effect that looked for the element once, at mount, found none and never watched anything: the frame then stayed what it was the
    // first time it was measured. Every render looks again, and the watching starts the first time the element is there (and again if it is replaced).
    const measureNow = useRef(measure);
    measureNow.current = measure;
    const watching = useRef<Watching<HTMLDivElement> | undefined>(undefined);
    useLayoutEffect(() => {
        measure();
        watching.current = keepWatching(watching.current, surface.current, root => watchSurface(root, () => measureNow.current()));
    });
    useLayoutEffect(() => () => { watching.current?.stop(); watching.current = undefined; }, []);

    return measured;
}

// Where the design-mode component and each of its items were drawn.
export function useDesignModeMeasurement(surface: RefObject<HTMLDivElement | null>, subject: DesignModeSubject | undefined): DesignModeMeasurement | undefined {
    const compute = useCallback((root: HTMLDivElement, origin: SurfaceOrigin): DesignModeMeasurement | undefined => {
        if (!subject) return undefined;
        const component = elementRect(root, subject.componentId, origin);
        const wrapper = root.querySelector(`[data-studio-element="${CSS.escape(subject.componentId)}"]`) ?? root.querySelector(`[data-scene-id="${CSS.escape(subject.componentId)}"]`);

        const items: Record<string, Rect> = {};
        for (const item of subject.source.items) {
            const rect = elementRect(root, item.id, origin) ?? (wrapper ? itemSelectors(item.id).map(selector => wrapper.querySelector(selector)).flatMap(node => node ? [nodeRect(node, origin)] : []).find(found => found !== undefined) : undefined);
            if (rect) items[item.id] = rect;
        }

        return { surface: { left: 0, top: 0, width: origin.width, height: origin.height }, component, items };
    }, [subject]);

    return useSurfaceMeasured(surface, compute, sameMeasurement);
}
