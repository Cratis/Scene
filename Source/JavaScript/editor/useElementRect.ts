// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RefObject, useEffect, useState } from 'react';

export interface ElementRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * Finds the rendered scene element (by its `data-scene-id`) within a container, relative to the container's
 * own bounding box - so an overlay positioned `absolute` inside that same container lines up with it.
 */
export function findSceneElementRect(container: HTMLElement, sceneElementId: string): ElementRect | undefined {
    const target = container.querySelector(`[data-scene-id="${sceneElementId}"]`);
    if (!target) {
        return undefined;
    }

    const containerBounds = container.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    return {
        left: targetBounds.left - containerBounds.left,
        top: targetBounds.top - containerBounds.top,
        width: targetBounds.width,
        height: targetBounds.height,
    };
}

/**
 * Tracks the container-relative bounding rect of a rendered scene element, re-measuring on resize of either
 * the container or the element itself. Returns `undefined` while `sceneElementId` is unset or unresolved.
 */
export function useElementRect(containerRef: RefObject<HTMLElement | null>, sceneElementId: string | undefined): ElementRect | undefined {
    const [rect, setRect] = useState<ElementRect | undefined>(undefined);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !sceneElementId) {
            setRect(undefined);
            return;
        }

        const measure = () => setRect(findSceneElementRect(container, sceneElementId));
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(container);
        return () => observer.disconnect();
    }, [containerRef, sceneElementId]);

    return rect;
}
