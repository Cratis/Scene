// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RefObject, useLayoutEffect, useState } from 'react';

/**
 * The width of an element, kept up to date, so a chart can draw at the size it is shown at instead of scaling a fixed drawing -
 * which would shrink its labels with it on a phone. Where there is no `ResizeObserver` (a test environment) the fallback is used.
 */
export function useElementWidth(reference: RefObject<HTMLElement | null>, fallback: number): number {
    const [width, setWidth] = useState(fallback);

    useLayoutEffect(() => {
        const element = reference.current;
        if (!element) return;

        const measure = () => {
            const measured = Math.round(element.getBoundingClientRect().width);
            if (measured > 0) setWidth(measured);
        };

        measure();
        if (typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [reference]);

    return width;
}
