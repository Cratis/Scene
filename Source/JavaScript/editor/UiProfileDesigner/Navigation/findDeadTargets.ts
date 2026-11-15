// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The navigation entries the host drew as dead: Scene marks an entry whose target does not resolve with data-nav-problem, so this reads
// what is actually on the canvas rather than a second opinion. Reported as navTargetMissing (spec N8).
export interface DeadTarget {
    id: string;
    label: string;
}

export function findDeadTargets(root: ParentNode): DeadTarget[] {
    return Array.from(root.querySelectorAll<HTMLElement>('[data-nav-problem="navTargetMissing"]')).map((element, index) => ({
        id: element.dataset.sceneId ?? `dead-${index}`,
        label: (element.textContent ?? '').trim(),
    }));
}
