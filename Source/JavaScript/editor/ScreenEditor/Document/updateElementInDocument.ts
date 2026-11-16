// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, SceneElement } from '@cratis/scene.model';

// A copy of the document with one element changed, wherever it sits: in a screen's slots or contributions, or in a
// screen or dialog template's content. The element is changed in place on the copy; the original is never touched.
export function updateElementInDocument(document: SceneDocument, elementId: string, update: (element: SceneElement) => void): SceneDocument {
    const clone = globalThis.structuredClone(document);
    for (const collection of [clone.screenTemplates, clone.dialogTemplates]) {
        for (const owner of collection) {
            for (const elements of Object.values(owner.content ?? {})) visit(elements, elementId, update);
        }
    }
    for (const screen of clone.screens) {
        for (const elements of Object.values(screen.slotContent)) visit(elements, elementId, update);
        for (const contribution of screen.contributions) visit([contribution.content], elementId, update);
    }
    return clone;
}

function visit(elements: SceneElement[], elementId: string, update: (element: SceneElement) => void): void {
    for (const element of elements) {
        if (element.id === elementId) update(element);
        visit(Object.values((element as { slots?: Record<string, SceneElement[]> }).slots ?? {}).flat(), elementId, update);
        const children = (element as unknown as { children?: SceneElement[] }).children;
        if (Array.isArray(children)) visit(children, elementId, update);
    }
}
