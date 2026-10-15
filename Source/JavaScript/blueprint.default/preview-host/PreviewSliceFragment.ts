// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneElement, Screen, SliceNode } from '@cratis/scene.model';

function matches(element: ExternalComponent, names: Set<string>): boolean {
    const properties = element.properties as Record<string, unknown> | undefined;
    return ['query', 'readModel', 'slice'].some(key => {
        const value = properties?.[key];
        return typeof value === 'string' && (names.has(value) || names.has(value.slice(value.lastIndexOf('.') + 1)));
    });
}

function childrenOf(element: SceneElement): SceneElement[] {
    const node = element as { slots?: Record<string, SceneElement[]>; children?: SceneElement[]; content?: SceneElement; itemTemplate?: SceneElement };
    return [
        ...Object.values(node.slots ?? {}).flat(),
        ...(Array.isArray(node.children) ? node.children : []),
        ...(node.content ? [node.content] : []),
        ...(node.itemTemplate ? [node.itemTemplate] : []),
    ];
}

/**
 * The data fragment of a State View slice (PRV3): the outermost components of the slice's screen bound to the slice's read model
 * or query - by the slice's qualified id, its id, its name or its command - each with everything inside it. Empty when the screen
 * has nothing bound to it.
 */
export function findSliceFragment(screen: Screen, sliceId: string, slice: SliceNode): SceneElement[] {
    const names = new Set([sliceId, slice.id, slice.name, ...(slice.command ? [slice.command] : [])]);
    const found: SceneElement[] = [];
    const visit = (element: SceneElement) => {
        if ((element as ExternalComponent).componentName !== undefined && matches(element as ExternalComponent, names)) {
            found.push(element);
            return;
        }

        childrenOf(element).forEach(visit);
    };

    Object.values(screen.slotContent).flat().forEach(visit);
    return found;
}
