// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';

// A copy of an element and everything inside it, each with an identity of its own - what Duplicate puts next to the original. Ids are the
// only thing that differs; two elements of one screen never share one.
export function cloneWithNewIds(element: SceneElement, newId: () => string): SceneElement {
    const copy = structuredClone(element) as unknown as Record<string, unknown>;
    renumber(copy, newId);
    return copy as unknown as SceneElement;
}

function renumber(value: unknown, newId: () => string): void {
    if (Array.isArray(value)) {
        for (const entry of value) renumber(entry, newId);
        return;
    }
    if (value === null || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    // An element is a record with an id and properties; what it holds - children, slots - are elements too.
    if (typeof record.id === 'string' && record.properties !== null && typeof record.properties === 'object') record.id = newId();
    for (const [key, child] of Object.entries(record)) if (key !== 'properties') renumber(child, newId);
}
