// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';

/** The width below which a screen is a phone's: the collapse rules of Part B 1.3 (list to cards, master-detail to stack) apply under it. */
export const compactQuery = '(max-width: 40rem)';

/** Whether the viewport is phone-wide, kept up to date. Without `matchMedia` (a test environment, server rendering) it is false, so the full layout renders. */
export function useCompactWidth(): boolean {
    const [compact, setCompact] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(compactQuery).matches);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const query = window.matchMedia(compactQuery);
        const update = () => setCompact(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    return compact;
}
