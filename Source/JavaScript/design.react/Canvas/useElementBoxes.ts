// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { ElementBox } from '../State/commentPins';

/** Reads where the elements of a drawn screen are, in the frame's own pixels: the zoom the frame is shown at is divided out. */
export function measureElementBoxes(frame: HTMLElement, scale: number): ElementBox[] {
    const base = frame.getBoundingClientRect();
    const boxes: ElementBox[] = [];
    frame.querySelectorAll('[data-scene-id]').forEach(node => {
        const id = node.getAttribute('data-scene-id');
        if (id === undefined || id === null || id === '') return;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        boxes.push({ id, x: (rect.left - base.left) / scale, y: (rect.top - base.top) / scale, width: rect.width / scale, height: rect.height / scale });
    });
    return boxes;
}

const sameBoxes = (left: readonly ElementBox[], right: readonly ElementBox[]): boolean =>
    left.length === right.length && left.every((box, index) => {
        const other = right[index]!;
        return box.id === other.id && Math.abs(box.x - other.x) < 0.5 && Math.abs(box.y - other.y) < 0.5 && Math.abs(box.width - other.width) < 0.5 && Math.abs(box.height - other.height) < 0.5;
    });

/**
 * The boxes of the elements drawn inside a frame. The screen is drawn lazily and may settle after it is first shown, so the boxes are read again
 * for a moment after each render and whenever the frame resizes; a pin follows its element because of this.
 */
export function useElementBoxes(frame: RefObject<HTMLElement | null>, scale: number, signature: string): { boxes: ElementBox[]; measure: () => ElementBox[] } {
    const [boxes, setBoxes] = useState<ElementBox[]>([]);
    const latest = useRef(boxes);
    latest.current = boxes;

    const measure = useCallback((): ElementBox[] => {
        const element = frame.current;
        if (element === null) return latest.current;
        const next = measureElementBoxes(element, scale);
        if (!sameBoxes(latest.current, next)) setBoxes(next);
        return next;
    }, [frame, scale]);

    useLayoutEffect(() => { measure(); }, [measure, signature]);

    useEffect(() => {
        const element = frame.current;
        if (element === null) return undefined;
        const timers = [60, 250, 800].map(delay => setTimeout(measure, delay));
        const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measure());
        observer?.observe(element);
        return () => { timers.forEach(clearTimeout); observer?.disconnect(); };
    }, [frame, measure, signature]);

    return { boxes, measure };
}
