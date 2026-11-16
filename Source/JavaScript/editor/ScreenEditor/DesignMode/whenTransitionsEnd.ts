// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

const endings = ['transitionend', 'transitioncancel', 'animationend', 'animationcancel'] as const;

/**
 * Calls `changed` whenever a transition or an animation anywhere under the target ends or is cancelled.
 *
 * A screen editor opens by scaling its window up from a small size: while that runs, every box measured on the surface is the scaled one, and when it ends
 * nothing on the surface has changed size - the observers of the surface's sizes and contents see nothing - so a frame measured during the opening stayed
 * the size of the scaled content (the slot's outline was about a tenth of the screen). The end of the transition is the moment to measure again.
 *
 * @param target Where the transitions and animations are heard: they end on elements around and inside the surface, and the event bubbles only upwards, so it is the document that listens.
 * @param changed What to call when one ends.
 * @returns What stops listening.
 */
export function whenTransitionsEnd(target: EventTarget, changed: () => void): () => void {
    endings.forEach(ending => target.addEventListener(ending, changed, { capture: true }));
    return () => endings.forEach(ending => target.removeEventListener(ending, changed, { capture: true }));
}
