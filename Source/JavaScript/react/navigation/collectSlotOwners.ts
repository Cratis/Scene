// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';

/** The registry key of the component that declares a nested slot. */
export const slotComponentName = 'core:slot';

/**
 * The owner of a slot the shell declares - a slot of the layout or root template, such as `side` - rather than a screen. The shell is
 * always on the page, so a screen placed in such a slot sits beside the primary screen and stays when the primary screen changes.
 */
export const shellSlotOwner = '\u0000shell';

/**
 * Which screen declares each nested slot: every `core:slot` element, by its `name`, mapped to the screen
 * whose tree contains it. A screen that declares a slot another screen also declares keeps the first one,
 * in screen order - the same rule navigation diagnostics report as a duplicate slot.
 */
export function collectSlotOwners(screens: Record<string, SceneElement>): Record<string, string> {
    const owners: Record<string, string> = {};
    for (const [screen, element] of Object.entries(screens)) {
        for (const slot of slotNames(element)) {
            if (!(slot in owners)) owners[slot] = screen;
        }
    }

    return owners;
}

function slotNames(element: SceneElement): string[] {
    const node = element as { componentName?: string; properties?: Record<string, unknown>; slots?: Record<string, SceneElement[]>; children?: SceneElement[] };
    const own = node.componentName === slotComponentName && typeof node.properties?.name === 'string' ? [node.properties.name] : [];
    const children = [...Object.values(node.slots ?? {}).flat(), ...(Array.isArray(node.children) ? node.children : [])];
    return [...own, ...children.flatMap(slotNames)];
}
