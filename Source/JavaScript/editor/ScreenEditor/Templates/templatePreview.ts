// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement, UiProfile } from '@cratis/scene.model';
import { TemplateCatalogKind, toComponentCatalog, type TemplateCatalogEntry } from '@cratis/scene.engine';
import { applyTemplatePreviewState, composeScreenElement, resolveElementComponentNames, type TemplatePreviewState } from '@cratis/scene.blueprint.default';
import type { ScenePackageBundle } from '@cratis/scene.react';

// What a template looks like before it is applied: the screen its package ships for it, composed and resolved against
// the profile given, with Scene's sample data put into the state asked for. A template no package ships a screen for has
// no preview.
export function templatePreview(templateName: string, state: TemplatePreviewState, bundles: readonly ScenePackageBundle[], profile: UiProfile): SceneElement | undefined {
    const screen = bundles.flatMap(bundle => bundle.screens ?? []).find(candidate => candidate.screenTemplate === templateName);
    if (!screen) return undefined;
    const catalog = toComponentCatalog(bundles.map(bundle => bundle.manifest));
    return applyTemplatePreviewState(resolveElementComponentNames(composeScreenElement(screen), profile, catalog), state);
}

// Scene's own account of a template - which package version it comes from, its license and attribution, and whether
// the host can run it.
export function catalogEntryOf(templateName: string, catalog: readonly TemplateCatalogEntry[]): TemplateCatalogEntry | undefined {
    return catalog.find(entry => entry.name === templateName && entry.kind === TemplateCatalogKind.ScreenTemplate);
}
