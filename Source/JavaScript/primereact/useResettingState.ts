// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useStructuralValue } from './useStructuralValue';

/**
 * State that starts from authored data and starts over when that data really changes.
 *
 * A control's selection or expansion is runtime state the user changes, yet it is also authored on the
 * element. Reading the authored value once (`useState(() => authored)`) ignores a later edit of the document;
 * resetting on every render discards what the user did. This does neither: the state follows `source` when
 * its content changes, compared structurally because every document edit clones the data, and is otherwise
 * left alone - so an unrelated property edit does not undo the user's choice.
 *
 * @param source The authored data the state derives from.
 * @param initial Derives the starting state from the authored data.
 * @returns The state and its setter, like `useState`.
 */
export function useResettingState<TState>(source: unknown, initial: () => TState): [TState, Dispatch<SetStateAction<TState>>] {
    const stable = useStructuralValue(source);
    const [held, setHeld] = useState(() => ({ source: stable, value: initial() }));
    let current = held;
    if (held.source !== stable) {
        current = { source: stable, value: initial() };
        setHeld(current);
    }

    const update = useCallback((action: SetStateAction<TState>) => {
        setHeld(previous => ({ source: previous.source, value: typeof action === 'function' ? (action as (state: TState) => TState)(previous.value) : action }));
    }, []);

    return [current.value, update];
}
