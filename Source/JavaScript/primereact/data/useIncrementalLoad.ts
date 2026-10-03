// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useState } from 'react';

/** How much of a list is loaded and how to load more. */
export interface IncrementalLoad {
    /** The number of entries loaded, never more than the total. */
    loaded: number;

    /** Loads the next chunk. */
    loadMore(): void;
}

/**
 * Tracks how many entries of a list are loaded, a chunk at a time.
 *
 * The count follows the authored properties: it starts over at one chunk when the chunk size changes or when
 * `resetKey` does, so a document edit that replaces the items does not leave the old count behind. Pass a
 * structurally stable `resetKey` (see `useStructuralValue`), or every render would reset it.
 *
 * @param total The number of entries there are.
 * @param chunk The number of entries per load.
 * @param resetKey Changes when the entries are replaced.
 */
export function useIncrementalLoad(total: number, chunk: number, resetKey: unknown): IncrementalLoad {
    const [state, setState] = useState({ resetKey, chunk, loaded: chunk });
    let loaded = state.loaded;
    if (state.resetKey !== resetKey || state.chunk !== chunk) {
        setState({ resetKey, chunk, loaded: chunk });
        loaded = chunk;
    }

    const loadMore = useCallback(() => setState(current => ({ ...current, loaded: Math.min(current.loaded + chunk, total) })), [chunk, total]);
    return { loaded: Math.min(loaded, total), loadMore };
}
