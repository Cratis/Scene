// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState, type RefObject } from 'react';

// Whether an element is on screen, or about to be: a board holds many thumbnails and only those near the part being looked at are drawn. Without
// an observer (a server render, an old engine) every element counts as near, because drawing too much is better than drawing nothing.
export function useIsNearViewport(target: RefObject<Element | null>, margin = 240): boolean {
    const supported = typeof IntersectionObserver !== 'undefined';
    const [near, setNear] = useState(!supported);

    useEffect(() => {
        const node = target.current;
        if (!node || !supported) return;
        const observer = new IntersectionObserver(entries => setNear(entries.some(entry => entry.isIntersecting)), { rootMargin: `${margin}px` });
        observer.observe(node);
        return () => observer.disconnect();
    }, [target, margin, supported]);

    return near;
}
