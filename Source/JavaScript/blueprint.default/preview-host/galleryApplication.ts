// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { LayoutName, defaultLayouts } from '../layouts';
import { fullPageChrome, applicationChrome } from '../gallery/applicationChrome';
import { galleryDialogTemplates } from '../gallery/dialogTemplates';
import { fullPageTemplateNames, galleryBreadcrumbs, galleryScreenTemplates } from '../gallery/screens';
import { ApplicationDocument } from './ApplicationDocument';
import { CompositionOptions } from './composeApplication';

/**
 * The blueprint's gallery as an application the hosts run (spec N5): one screen per template - named by the template, which is
 * what the gallery's menu entries and breadcrumbs target (`NavigationEntry.targetScreen`) -, the templates and dialog templates
 * themselves, and the layouts. A blueprint that has no authored structure therefore still navigates in a preview: every gallery
 * menu entry is a screen of this document, composed by `composeApplicationScreen` like any other.
 *
 * Use it with {@link galleryComposition}, which gives each screen the gallery's own chrome - the menu, the breadcrumb, the user menu.
 */
export function galleryApplication(): ApplicationDocument {
    const screens: Screen[] = galleryScreenTemplates.map(template => ({
        name: template.name,
        layout: fullPageTemplateNames.has(template.name) ? LayoutName.FullPage : LayoutName.AppShell,
        screenTemplate: template.name,
        slotContent: {},
        forms: [],
        contributions: [],
    }));

    return {
        layouts: defaultLayouts,
        screenTemplates: galleryScreenTemplates,
        dialogTemplates: galleryDialogTemplates,
        screens,
    };
}

/** What {@link galleryApplication} is composed with: the gallery's chrome for each screen, the full-page shell none beyond the configurator. */
export const galleryComposition: CompositionOptions = {
    chrome: (screen, shell) => fullPageTemplateNames.has(screen.name) || shell === ComponentName.FullPageShell
        ? fullPageChrome()
        : applicationChrome(screen.name, galleryBreadcrumbs[screen.name] ?? [{ label: galleryScreenTemplates.find(template => template.name === screen.name)?.displayName ?? screen.name }]),
};
