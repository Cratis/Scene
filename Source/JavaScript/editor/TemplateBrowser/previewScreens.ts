// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen, SceneElement, UiProfile } from '@cratis/scene.model';
import { toComponentCatalog } from '@cratis/scene.engine';
import { applyTemplatePreviewState, composeScreenElement, resolveElementComponentNames, templateContentInLayout, type TemplatePreviewState } from '@cratis/scene.blueprint.default';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import { TemplateOrigin } from './TemplateOrigin';
import { ownTemplateElement } from '../ScreenEditor/Templates/ownTemplateElement';

/**
 * The screens a template can be seen through: the screens of its own package that are built from it, which the package states (its gallery screens). An
 * own template has none - it is drawn from its saved document (`previewOfOwnTemplate`) - and neither has a shell.
 *
 * @param entry The template.
 * @param bundles Every bundle this build has loaded.
 * @returns The screens, in the order the package lists them.
 */
export function previewScreensOf(entry: TemplateBrowserEntry, bundles: readonly ScenePackageBundle[]): Screen[] {
    if (entry.origin === TemplateOrigin.Own || entry.package === undefined) return [];
    return bundles.filter(bundle => bundle.manifest.name === entry.package).flatMap(bundle => bundle.screens ?? []).filter(screen => screen.screenTemplate === entry.name);
}

/**
 * An application's own template as the element to draw: the template its saved document holds, with what it puts in its slots, in the profile it runs under.
 * It is drawn from the document, because an own template has no screen composed from it to look through (StudioIssues#947).
 *
 * @param entry The template.
 * @param documents The saved documents of the application's own templates, by template identifier.
 * @param state Populated, empty, loading or error.
 * @param bundles Every bundle this build has loaded.
 * @param profile The profile the template will run under.
 * @returns The element to draw, or nothing when the template is not an own one, has no saved document or puts nothing anywhere.
 */
export function previewOfOwnTemplate(entry: TemplateBrowserEntry, documents: ReadonlyMap<string, string> | undefined, state: TemplatePreviewState, bundles: readonly ScenePackageBundle[], profile: UiProfile): SceneElement | undefined {
    if (entry.origin !== TemplateOrigin.Own) return undefined;
    const element = ownTemplateElement(documents?.get(entry.reference.id.toLowerCase()), entry.reference.id);
    if (element === undefined) return undefined;
    const catalog = toComponentCatalog(bundles.map(bundle => bundle.manifest));
    return applyTemplatePreviewState(resolveElementComponentNames(element, profile, catalog), state);
}

/**
 * The screen drawn as the renderer Stage ships would draw it, under the profile it will run in and in the state chosen.
 *
 * @param screen The screen.
 * @param state Populated, empty, loading or error.
 * @param bundles Every bundle this build has loaded.
 * @param profile The profile the template will run under.
 * @returns The element to draw.
 */
export function previewOfScreen(screen: Screen, state: TemplatePreviewState, bundles: readonly ScenePackageBundle[], profile: UiProfile): SceneElement {
    const catalog = toComponentCatalog(bundles.map(bundle => bundle.manifest));
    return applyTemplatePreviewState(resolveElementComponentNames(composeScreenElement(withTemplateContent(screen, bundles)), profile, catalog), state);
}

/**
 * The screen with the content of its template in its slots when it carries none of its own. A blueprint's screen names the template it fills and leaves its
 * slots to it, so drawing the screen alone would draw the shell around nothing: the template's content is placed in the layout the way Scene places it.
 */
function withTemplateContent(screen: Screen, bundles: readonly ScenePackageBundle[]): Screen {
    if (Object.keys(screen.slotContent ?? {}).length > 0 || screen.screenTemplate === undefined) return screen;
    const template = bundles.flatMap(bundle => bundle.screenTemplates ?? []).find(candidate => candidate.name === screen.screenTemplate);
    const layout = bundles.flatMap(bundle => bundle.layouts ?? []).find(candidate => candidate.name === screen.layout);
    return template === undefined || layout === undefined ? screen : { ...screen, slotContent: templateContentInLayout(template, layout) };
}
