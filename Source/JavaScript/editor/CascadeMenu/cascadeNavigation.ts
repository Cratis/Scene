// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The key a cascading menu reacts to, as a direction through its rows or across its panels. */
export enum CascadeStep {
    Previous = 'previous',
    Next = 'next',
    First = 'first',
    Last = 'last',
    Into = 'into',
    Out = 'out',
}

/**
 * What a key press means to a cascading menu, or `undefined` when the menu leaves it alone.
 *
 * @param key The pressed key.
 * @param isTextField Whether focus is in a text field, which keeps the arrow keys that move its caret.
 * @returns The step.
 */
export function stepForKey(key: string, isTextField: boolean): CascadeStep | undefined {
    switch (key) {
        case 'ArrowDown': return CascadeStep.Next;
        case 'ArrowUp': return CascadeStep.Previous;
        case 'ArrowRight': return isTextField ? undefined : CascadeStep.Into;
        case 'ArrowLeft': return isTextField ? undefined : CascadeStep.Out;
        case 'Home': return isTextField ? undefined : CascadeStep.First;
        case 'End': return isTextField ? undefined : CascadeStep.Last;
        default: return undefined;
    }
}

/**
 * Where focus lands after a step through a panel's rows. Moving past either end wraps round, so a keyboard user can
 * never be left on a row with nowhere to go.
 *
 * @param step The step through the rows - `Previous`, `Next`, `First` or `Last`.
 * @param current The row that has focus, or -1 when none does.
 * @param count How many rows can take focus.
 * @returns The index to focus, or -1 when there are no rows.
 */
export function focusTarget(step: CascadeStep, current: number, count: number): number {
    if (count === 0) return -1;
    switch (step) {
        case CascadeStep.First: return 0;
        case CascadeStep.Last: return count - 1;
        case CascadeStep.Previous: return current <= 0 ? count - 1 : current - 1;
        default: return current < 0 || current >= count - 1 ? 0 : current + 1;
    }
}
