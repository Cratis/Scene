// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, TemplateRole, TemplateScope, type ScreenTemplate } from '@cratis/scene.model';
import { upgradeSlotShape } from '@cratis/scene.engine';
import { ApplicationTemplate } from './ApplicationTemplate';

const knownScopes = new Set<string>(Object.values(TemplateScope));
const knownKinds = new Set<string>(Object.values(SliceKind));

/**
 * What an application template's saved Scene document says about where it may be used: the category it is listed
 * under, the levels it is made for and the slice kinds it fits.
 *
 * The document is the one place that says it (spec TPL1, REN2) - Studio keeps no copy - so this reads it every time. A
 * document that is missing, is not JSON or has no such template yields nothing, which leaves the template offered
 * wherever a screen sits, as a template made before metadata existed always was.
 *
 * @param document The template's saved Scene document, as JSON text.
 * @param templateName The name the document knows the template by - its identifier.
 * @returns The metadata that was recorded; each member is absent when the document records none.
 */
export function readTemplateMetadata(document: string | undefined | null, templateName: string): Pick<ApplicationTemplate, 'category' | 'scopes' | 'sliceKinds' | 'role' | 'primarySlot' | 'slots'> {
    if (!document) return {};
    try {
        // A document stored before Scene 5 says its regions as outlets and its primary one in the metadata; it is read in the slot shape (StudioIssues#1328).
        const parsed = upgradeSlotShape(JSON.parse(document)).document as { screenTemplates?: { name?: string; slots?: { name?: unknown; primary?: unknown }[]; metadata?: { category?: unknown; scopes?: unknown; sliceKinds?: unknown; role?: unknown } }[] };
        const template = parsed.screenTemplates?.find(candidate => candidate.name?.toLowerCase() === templateName.toLowerCase());
        const metadata = template?.metadata;
        if (!metadata) return {};
        const declared = (template?.slots ?? []).filter((slot): slot is { name: string; primary?: unknown } => typeof slot.name === 'string' && slot.name !== '');
        const slots = declared.map(slot => slot.name);
        const primarySlot = declared.find(slot => slot.primary === true)?.name;
        const scopes = list(metadata.scopes, knownScopes) as TemplateScope[];
        const sliceKinds = list(metadata.sliceKinds, knownKinds) as SliceKind[];
        return {
            ...(typeof metadata.category === 'string' && metadata.category.trim() !== '' ? { category: metadata.category.trim() } : {}),
            ...(scopes.length > 0 ? { scopes } : {}),
            ...(sliceKinds.length > 0 ? { sliceKinds } : {}),
            ...(metadata.role === TemplateRole.Root ? { role: TemplateRole.Root } : {}),
            ...(primarySlot === undefined ? {} : { primarySlot }),
            ...(slots.length > 0 ? { slots } : {}),
        };
    } catch {
        return {};
    }
}

const list = (value: unknown, known: Set<string>): string[] => Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string' && known.has(entry)) : [];

/**
 * The template a saved Scene document of an application template declares, whole: what it places in its own slots and how it is arranged, as the engine and
 * the preview host read it. Studio keeps no copy of it, so this reads it every time, in the slot shape when it was stored before Scene 5.
 *
 * @param document The template's saved Scene document, as JSON text.
 * @param templateName The name the document knows the template by - its identifier.
 * @returns The template, or `undefined` when the document is missing, is not JSON or declares no such template.
 */
export function readScreenTemplate(document: string | undefined | null, templateName: string): ScreenTemplate | undefined {
    if (!document) return undefined;
    try {
        const parsed = upgradeSlotShape(JSON.parse(document)).document as { screenTemplates?: ScreenTemplate[] };
        return parsed.screenTemplates?.find(candidate => candidate.name?.toLowerCase() === templateName.toLowerCase());
    } catch {
        return undefined;
    }
}
