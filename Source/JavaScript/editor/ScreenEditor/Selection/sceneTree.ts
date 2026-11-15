// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isCanvas, isExternalComponent, isPanel } from '@cratis/scene.engine';
import type { SceneElement } from '@cratis/scene.model';

// The elements nested directly inside an element: a panel's children, or what a component holds in its slots.
export function childrenOfElement(element: SceneElement): SceneElement[] {
    if (isPanel(element)) return element.children;
    if (isExternalComponent(element)) return Object.values(element.slots).flat();
    return [];
}

// Every element id in the trees, parents before children.
export function everyElementId(roots: readonly SceneElement[]): string[] {
    return roots.flatMap(element => [(element as { id: string }).id, ...everyElementId(childrenOfElement(element))]);
}

// Finds an element anywhere in the trees.
export function findSceneElement(roots: readonly SceneElement[], id: string): SceneElement | undefined {
    for (const root of roots) {
        if ((root as { id: string }).id === id) return root;
        const nested = findSceneElement(childrenOfElement(root), id);
        if (nested) return nested;
    }

    return undefined;
}

// The element that holds the one with this id, if it is held by any.
export function parentOf(roots: readonly SceneElement[], id: string): SceneElement | undefined {
    for (const root of roots) {
        if (childrenOfElement(root).some(child => (child as { id: string }).id === id)) return root;
        const nested = parentOf(childrenOfElement(root), id);
        if (nested) return nested;
    }

    return undefined;
}

// Whether the element is held directly by a canvas.
export function isCanvasHolding(roots: readonly SceneElement[], id: string): boolean {
    const parent = parentOf(roots, id);
    return parent !== undefined && isCanvas(parent as never);
}
