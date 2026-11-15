// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useLayoutEffect, useState, type RefObject } from 'react';

const hostGivesHeight = (viewportHeight: number | undefined): boolean => viewportHeight !== undefined;

const canObserveResizes = (): boolean => typeof ResizeObserver !== 'undefined';

// The height of the space the surface is drawn in - the nearest element marked `data-studio-viewport`, else its parent - for a component that fills the
// screen (`100vh`) to fill, and not the browser window around the editor. Undefined when the host gives the height or nothing can be measured.
export const useSurfaceViewportHeight = (surface: RefObject<HTMLDivElement | null>, viewportHeight: number | undefined): number | undefined => {
    const [measuredHeight, setMeasuredHeight] = useState<number>();

    useLayoutEffect(() => {
        const space = surface.current?.closest<HTMLElement>('[data-studio-viewport]') ?? surface.current?.parentElement;
        if (!space || hostGivesHeight(viewportHeight) || !canObserveResizes()) return;
        const observer = new ResizeObserver(() => setMeasuredHeight(space.clientHeight));
        setMeasuredHeight(space.clientHeight);
        observer.observe(space);
        return () => observer.disconnect();
    }, [surface, viewportHeight]);

    return viewportHeight ?? measuredHeight;
};
