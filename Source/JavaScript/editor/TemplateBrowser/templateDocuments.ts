// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate } from '@cratis/scene.model';

/** The layout every application template sits in: a single content slot, the same one the server starts a new template from. */
const studioScreen = { name: 'StudioScreen', slots: [{ name: 'content' }] };

const emptyCollections = { dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] };

/**
 * The Scene document of an application template that starts as a copy of a blueprint's screen template. The copy is the template as the blueprint wrote
 * it - its slots, arrangement, content, behaviors, outlets and metadata, attribution and license included - under the new template's identifier.
 *
 * @param template The blueprint's screen template.
 * @param id The identifier of the application template that is being made; it is the name the document knows the template by.
 * @param displayName What the author called the copy.
 * @returns The document, as JSON text.
 */
export function copiedBlueprintDocument(template: ScreenTemplate, id: string, displayName: string): string {
    return JSON.stringify({
        layouts: [studioScreen],
        screenTemplates: [{ ...template, name: id, displayName }],
        ...emptyCollections,
    });
}

/**
 * The Scene document of an application template that starts as a copy of another one: everything the source document holds, with the source's template
 * taken under the new identifier.
 *
 * @param document The source's saved document, as JSON text.
 * @param fromId The identifier of the template that is copied.
 * @param toId The identifier of the application template that is being made.
 * @param displayName What the author called the copy.
 * @returns The document, as JSON text; nothing when the source has no document or its document does not hold the template, so the copy starts empty.
 */
export function duplicatedDocument(document: string | undefined | null, fromId: string, toId: string, displayName: string): string | undefined {
    if (!document) return undefined;
    try {
        const parsed = JSON.parse(document) as { screenTemplates?: { name?: string; displayName?: string }[] };
        const source = parsed.screenTemplates?.find(template => template.name?.toLowerCase() === fromId.toLowerCase());
        if (!source) return undefined;
        return JSON.stringify({
            ...parsed,
            screenTemplates: [{ ...source, name: toId, displayName }, ...(parsed.screenTemplates ?? []).filter(template => template !== source)],
        });
    } catch {
        return undefined;
    }
}
