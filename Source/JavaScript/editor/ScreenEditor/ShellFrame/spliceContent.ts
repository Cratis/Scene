// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';

// Returns the tree with the element of the given id replaced by the content; everything else is shared, untouched, so a tree that did not
// change keeps its identity and the renderer can skip it. Used to put the screen into a shell composed once (spec: memoise the shell tree).
export function spliceContent(root: SceneElement, id: string, content: SceneElement): SceneElement {
    if (root.id === id) return content;
    const holder = root as SceneElement & { children?: SceneElement[]; slots?: Record<string, SceneElement[]> };
    let changed = false;

    const replace = (items: SceneElement[]): SceneElement[] => items.map(item => {
        const next = spliceContent(item, id, content);
        if (next !== item) changed = true;
        return next;
    });

    const children = holder.children ? replace(holder.children) : undefined;
    const slots = holder.slots ? Object.fromEntries(Object.entries(holder.slots).map(([name, items]) => [name, replace(items)])) : undefined;
    if (!changed) return root;
    return { ...holder, ...(children ? { children } : {}), ...(slots ? { slots } : {}) };
}
