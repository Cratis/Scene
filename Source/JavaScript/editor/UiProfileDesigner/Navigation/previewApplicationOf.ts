// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateRole, type DialogTemplate, type Layout, type Screen, type ScreenTemplate } from '@cratis/scene.model';
import { resolveProfileIdentity, toComponentCatalog } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import {
    ApplicationDocument,
    CompositionOptions,
    ComponentName,
    LayoutName,
    defaultApplicationChrome,
    defaultLayouts,
    galleryApplication,
    galleryCompositionFor,
} from '@cratis/scene.blueprint.default';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';

// What the canvas runs: the application document and how Scene's preview host composes it.
export interface PreviewApplication {
    document: ApplicationDocument;
    composition: CompositionOptions;
}

const unique = <T extends { name: string }>(items: T[]): T[] => items.filter((item, index) => items.findIndex(other => other.name === item.name) === index);

// The application the canvas shows for a profile: one screen per screen template of the resolved packages, in the shell the profile
// chose, so every navigation entry of the shell leads to a screen the host can render (spec N5). The blueprint's own gallery
// supplies the chrome and the page-or-full-page decision of its screens; templates it does not know get the default chrome.
// Nothing here is a second implementation of composition: the host composes each screen with Stage's own function (REN2).
export function previewApplicationOf(resolved: ResolvedUiProfile, bundles: ScenePackageBundle[], own: readonly ScreenTemplate[] = [], applicationName = ''): PreviewApplication {
    const selected = resolved.selection.packages.flatMap(name => bundles.filter(bundle => bundle.manifest.name === name));
    const gallery = galleryApplication();
    const galleryLayouts = new Map(gallery.screens.map(screen => [screen.name, screen.layout]));
    const shellLayout = resolved.layout.length > 0 ? resolved.layout : LayoutName.AppShell;

    const layouts: Layout[] = unique([...selected.flatMap(bundle => bundle.layouts ?? []), ...defaultLayouts]);
    // The application's own templates are in the document so the host can draw them: an own shell (a template that is the application's root) is looked up by
    // the profile's root; it is a shell, not a page, so no screen is made of it.
    const screenTemplates: ScreenTemplate[] = unique([...own, ...gallery.screenTemplates, ...selected.flatMap(bundle => bundle.screenTemplates ?? [])]);
    const dialogTemplates: DialogTemplate[] = unique([...(gallery.dialogTemplates ?? []), ...selected.flatMap(bundle => bundle.dialogTemplates ?? [])]);
    const screens: Screen[] = screenTemplates.filter(template => template.metadata?.role !== TemplateRole.Root).map(template => ({
        name: template.name,
        layout: galleryLayouts.get(template.name) === LayoutName.FullPage ? LayoutName.FullPage : shellLayout,
        screenTemplate: template.name,
        slotContent: {},
        forms: [],
        contributions: [],
    }));

    const document: ApplicationDocument = { layouts, screenTemplates, dialogTemplates, screens, uiProfiles: [resolved.profile] };
    // The application's own name and logo, as Scene resolves them from the profile, are what every shell draws; only a profile that chose none keeps the gallery's.
    const identity = resolved.profile.identity === undefined && applicationName === '' ? undefined : resolveProfileIdentity(resolved.profile, applicationName);
    const gallerySlots = galleryCompositionFor(identity);
    const composition: CompositionOptions = {
        profile: resolved.profile,
        catalog: toComponentCatalog(selected.map(bundle => bundle.manifest)),
        identity,
        chrome: (screen, shell) => galleryLayouts.has(screen.name) ? gallerySlots.chrome!(screen, shell) : shell === ComponentName.FullPageShell ? {} : defaultApplicationChrome(undefined, identity),
    };

    return { document, composition };
}
