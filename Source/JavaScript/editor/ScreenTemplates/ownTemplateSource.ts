// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, TemplateScope, type ScreenTemplate, type Slot } from '@cratis/scene.model';
import type { TemplateSource } from '@cratis/scene.engine';
import { ApplicationTemplate } from './ApplicationTemplate';

/** The levels an application template fits when it was made without saying: everywhere a screen sits. */
export const defaultApplicationTemplateScopes: readonly TemplateScope[] = [TemplateScope.Module, TemplateScope.Feature, TemplateScope.Subfeature, TemplateScope.Slice];

/** The name Scene sees the application's own templates under. It is never shown: own templates are listed without a package. */
export const ownTemplatePackageName = 'application';

/**
 * Presents the application's own templates to Scene as a template source, so the one applicability rule that
 * covers blueprints covers them too.
 *
 * An own template has no slot contract, so it carries no `fitsSlot`; its identifier is its Scene name and the
 * name the user gave it is its display name.
 *
 * @param templates The templates built for the application.
 * @returns The Scene source.
 */
export function ownTemplateSource(templates: readonly ApplicationTemplate[]): TemplateSource {
    return ownTemplateSourceOf(screenTemplatesOf(templates));
}

/**
 * Presents screen templates that are already in Scene's shape (see {@link namedAsScreensRefer}) as the application's own template source.
 *
 * @param templates The application's own screen templates.
 * @returns The Scene source.
 */
export function ownTemplateSourceOf(templates: readonly ScreenTemplate[]): TemplateSource {
    return {
        manifest: {
            name: ownTemplatePackageName,
            version: '0.0.0',
            kind: PackageKind.Blueprint,
            dependencies: [],
            components: [],
            layouts: [],
            screenTemplates: templates.map(template => template.name),
            dialogTemplates: [],
            themes: [],
        },
        screenTemplates: [...templates],
    };
}

/**
 * The application's own templates as Scene screen templates named the way a screen refers to them: by the name its author gave. A slice
 * stores that name (`screen template SideSummary`); the identifier the catalog keeps is only how Studio finds the template's document, so
 * a screen editor that looks a template up by identifier calls a template a screen already uses "missing" (StudioIssues#998).
 *
 * @param templates The templates built for the application.
 * @returns The Scene templates, with the author's name as the name and the display name.
 */
export function namedAsScreensRefer(templates: readonly ApplicationTemplate[]): ScreenTemplate[] {
    return screenTemplatesOf(templates.map(template => ({ ...template, id: template.name })));
}

// The slots the document declares, or - for a template known only by its catalog entry - the slots the catalog lists, the primary one marked.
function slotsOf(template: ApplicationTemplate): Slot[] {
    const declared: Slot[] = template.template?.slots ?? (template.slots ?? []).map(name => ({ name }));
    if (template.primarySlot === undefined || declared.some(slot => slot.primary === true)) return declared;
    return declared.map(slot => slot.name === template.primarySlot ? { ...slot, primary: true } : slot);
}

function screenTemplatesOf(templates: readonly ApplicationTemplate[]): ScreenTemplate[] {
    return templates.map((template): ScreenTemplate => ({
        // What the saved document declares comes first - the content a shell places and its arrangement are what draws it - and what the catalog read
        // from it (the metadata) is the same as the document's own.
        ...template.template,
        name: template.id,
        displayName: template.name,
        slots: slotsOf(template),
        metadata: {
            category: template.category,
            scopes: template.scopes ?? [...defaultApplicationTemplateScopes],
            sliceKinds: template.sliceKinds,
            ...(template.role === undefined ? {} : { role: template.role }),
        },
    }));
}
