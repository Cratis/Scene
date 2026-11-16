// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

const hasBox = (element: Element): boolean => {
    const { width, height } = element.getBoundingClientRect();
    return width > 0 && height > 0;
};

// Whether something inside has a box of its own on the page. A wrapper drawn as `display: contents` has no box, so what it holds is looked at
// instead; a box that is zero-sized does not count, since the author could not see or grab it.
export const holdsVisibleContent = (probe: Element): boolean =>
    Array.from(probe.children)
        .filter(child => !child.hasAttribute('data-studio-placeholder-for'))
        .some(child => hasBox(child) || (getComputedStyle(child).display === 'contents' && holdsVisibleContent(child)));

// How long a component may draw nothing before it is reported, so a component that draws on the next frame does not flash a note.
const settleMilliseconds = 150;

// Whether the component inside the probe draws anything. Reported as true until it has been seen to draw nothing for a moment, and
// watched afterwards, because a component can start drawing when its data arrives.
export function useRendersVisibleContent(probe: RefObject<HTMLElement | null>, dependency: unknown): boolean {
    const [drawsSomething, setDrawsSomething] = useState(true);

    // What was last reported, so the state is set only when the answer changes. Setting it to the same value from a layout
    // effect still schedules a render, and a component whose element is rebuilt on every render - one inside a template that
    // is composed again - would loop until React gives up.
    const reported = useRef(true);

    useLayoutEffect(() => {
        const element = probe.current;
        if (!element) return;

        const report = (value: boolean) => {
            if (reported.current === value) return;
            reported.current = value;
            setDrawsSomething(value);
        };

        let timer: ReturnType<typeof setTimeout> | undefined;
        const check = () => {
            clearTimeout(timer);
            if (holdsVisibleContent(element)) report(true);
            else timer = setTimeout(() => report(holdsVisibleContent(element)), settleMilliseconds);
        };
        const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(check);
        const watchChildren = () => { resize?.disconnect(); Array.from(element.children).forEach(child => resize?.observe(child)); };
        const mutation = new MutationObserver(() => { watchChildren(); check(); });

        check();
        watchChildren();
        mutation.observe(element, { childList: true });
        return () => { clearTimeout(timer); resize?.disconnect(); mutation.disconnect(); };
    }, [probe, dependency]);

    return drawsSomething;
}
