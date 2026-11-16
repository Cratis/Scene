// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isDeleteKey, isTypingTarget, type DeleteKeyEvent } from '../Structure/isDeleteKey';
import { designModeActions } from './designModeTypes';
import type { DesignModeState } from './useDesignMode';

export interface DesignModeKeyEvent extends DeleteKeyEvent {
    preventDefault: () => void;
    stopPropagation: () => void;
}

const controls = 'button, a[href], [role="button"], [role="radio"], [role="option"], [role="menuitem"]';
const onAControl = (target: EventTarget | null): boolean => { const element = target as Partial<Element> | null; return !!element && typeof element.closest === 'function' && element.closest(controls) !== null; };

// What a key does while a design-mode component or one of its items is selected (DM7): Esc deselects - the item first, then the component -,
// Enter moves into the item's title to rename it, Alt with the arrows moves the item earlier or later, and Delete removes it. Whether the
// key is honoured at all is the item's: a read-only item hides the actions, so its keys do nothing. Returns whether the key was taken.
export function handleDesignModeKey(event: DesignModeKeyEvent, state: DesignModeState, focusTitle: () => boolean): boolean {
    const { subject } = state;
    if (!subject) return false;
    const typing = isTypingTarget(event.target);
    const take = () => { event.preventDefault(); event.stopPropagation(); return true; };

    if (event.key === 'Escape' && !typing) { state.deselect(); return take(); }

    const item = subject.selected;
    if (!item || typing || item.readOnly) return false;

    // Enter on a control of the toolbar or of a popover presses that control: a chip opens its choice from the keyboard. Only Enter on the screen itself moves into the title.
    if (event.key === 'Enter' && !event.altKey && !event.ctrlKey && !event.metaKey) return !onAControl(event.target) && focusTitle() ? take() : false;

    if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const earlier = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
        const later = event.key === 'ArrowDown' || event.key === 'ArrowRight';
        if (earlier || later) { state.act(earlier ? designModeActions.moveEarlier : designModeActions.moveLater, item); return take(); }
    }

    if (isDeleteKey(event)) { state.act(designModeActions.delete, item); return take(); }
    return false;
}
