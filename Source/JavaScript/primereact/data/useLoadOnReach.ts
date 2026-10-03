// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RefObject, useEffect } from 'react';

/**
 * Calls `onReach` while the sentinel is visible, which is what scrolling to the end of a list means.
 *
 * The observer is rebuilt whenever `revision` changes, so a sentinel that is still visible after a chunk was
 * loaded loads the next one, until the viewport is filled or the list ends. `root` is the element that
 * scrolls for an inline list; `null` observes the page's own viewport. Where there is no
 * `IntersectionObserver` nothing is observed and the list's own button remains the way to load more.
 *
 * @param sentinel The element placed after the last loaded entry.
 * @param root The scrolling container, or `null` for the page.
 * @param active Whether reaching the end should load anything.
 * @param revision A value that changes each time the list changed.
 * @param onReach Loads the next chunk.
 */
export function useLoadOnReach(sentinel: RefObject<HTMLElement | null>, root: RefObject<HTMLElement | null> | null, active: boolean, revision: unknown, onReach: () => void): void {
    useEffect(() => {
        const target = sentinel.current;
        if (!active || target === null || typeof IntersectionObserver === 'undefined') return undefined;

        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) onReach();
        }, { root: root?.current ?? null, rootMargin: '0px 0px 48px 0px' });
        observer.observe(target);
        return () => observer.disconnect();
    }, [sentinel, root, active, revision, onReach]);
}
