// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, SceneElement, ScreenTemplate } from '@cratis/scene.model';
import { LayoutItem } from '../Layouts/LayoutItem';
import { createPanel } from '../Document/createPanel';
import { parseStoredDocument } from '../Document/upgradeStoredDocument';
import { needsSlotSections, slotSectionsOf } from './slotSections';

const rootId = 'template-preview';

// The template a saved document holds, or nothing when the text is not a document with one template in it.
function templateOf(documentText: string | undefined | null, id: string): ScreenTemplate | undefined {
    if (!documentText) return undefined;
    try {
        const document = parseStoredDocument<Partial<SceneDocument>>(documentText);
        const templates = document.screenTemplates ?? [];
        return templates.find(candidate => candidate.name?.toLowerCase() === id.toLowerCase()) ?? (templates.length === 1 ? templates[0] : undefined);
    } catch {
        return undefined;
    }
}

/**
 * An own template - the one a saved document holds - as the element it is drawn as: its slots laid out the way its arrangement shares the space, with what the
 * template puts in each. The template gallery draws it so an application's own template is seen as what it is, not as "no thumbnail" (StudioIssues#947).
 *
 * @param documentText The saved document, as stored.
 * @param id The identifier the document knows the template by.
 * @returns The element, or nothing when the document holds no template or the template puts nothing anywhere.
 */
export function ownTemplateElement(documentText: string | undefined | null, id: string): SceneElement | undefined {
    const template = templateOf(documentText, id);
    if (!template) return undefined;

    const roots = needsSlotSections(template)
        ? slotSectionsOf(template, false).elements
        : template.slots.flatMap(slot => template.content?.[slot.name] ?? []);
    const drawn = roots.some(hasContent) ? roots : [];
    return drawn.length === 0 ? undefined : createPanel(LayoutItem.Stack, rootId, 'Template', drawn);
}

// Whether anything is drawn in the element: a section that holds no component is only a place.
function hasContent(element: SceneElement): boolean {
    const candidate = element as unknown as { componentName?: unknown; children?: SceneElement[]; slots?: Record<string, SceneElement[]> };
    if (typeof candidate.componentName === 'string') return true;
    return (candidate.children ?? []).some(hasContent) || Object.values(candidate.slots ?? {}).some(children => children.some(hasContent));
}
