// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isTypingTarget } from '../Structure/isDeleteKey';

// The pointer events a component on the surface would act on. Menus, tab views, toolbars, links and navigation bars open, switch or
// navigate on a press, and many of them stop the event from travelling any further - so the surface meets them first, on the way down.
export const designTimePointerEvents = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick'] as const;

// The things on the surface an element can be found by: the element's own node, the wrapper the editor gives every element, and the stand-in
// drawn for one that has no visual of its own.
export const elementHitSelector = '[data-scene-id], [data-studio-element], [data-studio-placeholder-for]';

// What the surface does with a pointer event that landed inside the screen. While designing, a press on a component selects the element it
// belongs to and does nothing else - no navigation, no menu, no tab switch, no toggle - because the screen is being drawn, not played. A press in
// a field that takes typing is the exception: it still selects, but it reaches the field, so text can be put into it and a caret placed.
export interface DesignTimePointerDecision {
    // Whether the event selects the element it landed on: the press that starts a click, and the click itself for a click that did not come from a
    // pointer, such as a keyboard activation. A disabled control hears no click at all, so a selection that waited for one would never come.
    select: boolean;

    // Whether the event stops here, so that nothing inside the component hears it.
    swallow: boolean;

    // Whether the browser's own action for it (following a link, submitting, toggling a box) is cancelled.
    cancelDefault: boolean;
}

export function decideDesignTimePointer(type: string, target: EventTarget | null, button = 0): DesignTimePointerDecision {
    const typing = isTypingTarget(target);
    return {
        select: (type === 'pointerdown' && button === 0) || type === 'click',
        swallow: !typing,
        cancelDefault: !typing && type === 'click',
    };
}

// The id of the element a target belongs to, innermost first.
export function elementIdAt(target: EventTarget | null): string | undefined {
    const element = target as Partial<Element> | null;
    const hit = element && typeof element.closest === 'function' ? element.closest<HTMLElement>(elementHitSelector) : null;
    return hit?.dataset.sceneId ?? hit?.dataset.studioElement ?? hit?.dataset.studioPlaceholderFor;
}

// The item of a component a target belongs to - a row of a navigation bar, an item of a navigation region, an item of an outlet - when the component
// marks its items. A component that does not mark them has none to point at, and a press on it selects the component alone.
export const itemHitSelector = '[data-scene-item], [data-scene-nav-item], [data-scene-outlet-item]';

export function itemIdAt(target: EventTarget | null, point?: { x: number; y: number }): string | undefined {
    const element = target as Partial<Element> | null;
    const hit = (element && typeof element.closest === 'function' ? element.closest<HTMLElement>(itemHitSelector) : null) ?? itemUnder(element, point);
    return hit?.dataset.sceneItem ?? hit?.dataset.sceneNavItem ?? hit?.dataset.sceneOutletItem;
}

// A disabled button never receives the press - the surface lets it fall through to its outlet - so the item is the one whose box holds the pointer inside the
// element pressed: an action of a toolbar that waits for a selection is still selected for editing.
function itemUnder(element: Partial<Element> | null, point?: { x: number; y: number }): HTMLElement | null {
    if (!point || typeof element?.querySelectorAll !== 'function') return null;
    const items = Array.from(element.querySelectorAll<HTMLElement>(itemHitSelector));
    return items.reverse().find(item => {
        const box = item.getBoundingClientRect();
        return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
    }) ?? null;
}
