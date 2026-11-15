// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { ScreenFit, type DialogTemplate, type SceneDocument, type Screen } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';

// What the editor says a screen fits, in order of preference - the one answer every part of the editor reads (the details panel, the frame the
// screen is drawn in, the thumbnail, Play, the dialog's button row), so what is shown as the fit is what decides how the screen is drawn.
//
// A screen lists what it fits, and what it lists wins. One that lists nothing is decided by the template it names: a dialog template (the document's or a
// blueprint's - the stored form of a screen built from a blueprint's `QuickCreateDialog` is that name alone) makes it a dialog whatever its slice is, and a
// screen template (a page's) makes it a page. One that names neither fits a dialog only when it is opened over a page - a State Change slice's screen, which
// a hook opens, and which is how the stored form writes a lone Dialog (`opensOverPage`) - and a page otherwise, as Screenplay reads a screen without `fits`.
export function displayedFitsOf(
    screen: Pick<Screen, 'fits' | 'screenTemplate'> | undefined,
    pageTemplateNames: readonly string[] = [],
    opensOverPage = false,
    dialogTemplateNames: readonly string[] = defaultDialogTemplateNames
): readonly ScreenFit[] {
    if (screen?.fits && screen.fits.length > 0) return screen.fits;
    const named = screen?.screenTemplate;
    if (named !== undefined && dialogTemplateNames.includes(named)) return [ScreenFit.Dialog];
    if (named !== undefined && pageTemplateNames.includes(named)) return [ScreenFit.Page];
    return opensOverPage ? [ScreenFit.Dialog] : [ScreenFit.Page];
}

const defaultDialogTemplateNames: readonly string[] = (defaultBlueprint.dialogTemplates ?? []).map(template => template.name);

// The names of the dialog templates a screen may name: the document's own, the Default blueprint's and those of `known` (the other blueprints'), except a
// name a screen template of the document stands for - that one is the document's page template.
export function dialogTemplateNamesOf(document: Pick<SceneDocument, 'dialogTemplates' | 'screenTemplates'> | undefined, known: readonly Pick<DialogTemplate, 'name'>[] = []): string[] {
    const own = new Set((document?.screenTemplates ?? []).map(template => template.name));
    const names = new Set<string>((document?.dialogTemplates ?? []).map(template => template.name));
    for (const template of [...(defaultBlueprint.dialogTemplates ?? []), ...known]) if (!own.has(template.name)) names.add(template.name);
    return [...names];
}

// The names of the screen templates a screen may be built from: the document's own, the Default blueprint's and those of the blueprints in play.
export function pageTemplateNamesOf(document: Pick<SceneDocument, 'screenTemplates'> | undefined, bundles: readonly Pick<ScenePackageBundle, 'screenTemplates'>[] = []): string[] {
    const names = new Set<string>();
    for (const template of [...(document?.screenTemplates ?? []), ...(defaultBlueprint.screenTemplates ?? []), ...bundles.flatMap(bundle => bundle.screenTemplates ?? [])]) names.add(template.name);
    return [...names];
}

// The dialog templates the blueprints provide: the Default blueprint's - which every application can name, and which the bundles in play may not carry -
// and those of the bundles, each name once.
export function blueprintDialogTemplatesOf(bundles: readonly Pick<ScenePackageBundle, 'dialogTemplates'>[] = []): DialogTemplate[] {
    const seen = new Set<string>();
    return [...(defaultBlueprint.dialogTemplates ?? []), ...bundles.flatMap(bundle => bundle.dialogTemplates ?? [])].filter(template => !seen.has(template.name) && !!seen.add(template.name));
}
