// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';

/** The registry key of the component that declares a nested outlet. */
export const outletComponentName = 'core:outlet';

/**
 * Which screen declares each nested outlet: every `core:outlet` element, by its `name`, mapped to the screen
 * whose tree contains it. A screen that declares an outlet another screen also declares keeps the first one,
 * in screen order - the same rule navigation diagnostics report as a duplicate outlet.
 */
export function collectOutletOwners(screens: Record<string, SceneElement>): Record<string, string> {
    const owners: Record<string, string> = {};
    for (const [screen, element] of Object.entries(screens)) {
        for (const outlet of outletNames(element)) {
            if (!(outlet in owners)) owners[outlet] = screen;
        }
    }

    return owners;
}

function outletNames(element: SceneElement): string[] {
    const node = element as { componentName?: string; properties?: Record<string, unknown>; slots?: Record<string, SceneElement[]>; children?: SceneElement[] };
    const own = node.componentName === outletComponentName && typeof node.properties?.name === 'string' ? [node.properties.name] : [];
    const children = [...Object.values(node.slots ?? {}).flat(), ...(Array.isArray(node.children) ? node.children : [])];
    return [...own, ...children.flatMap(outletNames)];
}
