// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { structurallyEqual } from '../structurallyEqual';
import { MultiStateOption } from './MultiStateOption';

interface Selection {
    source: unknown;
    values: unknown[];
    index: number;
}

/**
 * The state a multi-state checkbox is in, as an index into its states.
 *
 * The position is tracked by index, not recovered by looking the current value up: several states can
 * share a value (a duplicated option), and a lookup by value always finds the first of them, which would
 * make every later state unreachable. The index follows the cycle; the value is only used to find the
 * starting position.
 *
 * The control is driven by the document as well as by the user. When the authored `value` or the states
 * change in content - an edit in the inspector, a hydrated document - the selection starts again from the
 * new value. A document clone with equal content changes nothing, so the user's position survives it.
 *
 * @param states The states, in cycle order.
 * @param value The authored current value.
 * @returns The selected index (`-1` when the value matches no state) and a function that moves to the next.
 */
export function useMultiStateSelection(states: MultiStateOption[], value: unknown): { index: number; advance(): number } {
    const values = states.map(state => state.value);
    const start = (): Selection => ({ source: value, values, index: values.findIndex(candidate => structurallyEqual(candidate, value)) });
    const [selection, setSelection] = useState<Selection>(start);

    let current = selection;
    if (!structurallyEqual(selection.source, value) || !structurallyEqual(selection.values, values)) {
        current = start();
        setSelection(current);
    }

    const advance = () => {
        const index = states.length === 0 ? -1 : (current.index + 1) % states.length;
        setSelection({ ...current, index });
        return index;
    };

    return { index: current.index, advance };
}
