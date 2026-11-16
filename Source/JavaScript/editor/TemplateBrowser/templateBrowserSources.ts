// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { ownTemplateSource } from '../ScreenTemplates/ownTemplateSource';
import type { ApplicationTemplate } from '../ScreenTemplates/ApplicationTemplate';
import { toTemplateSources } from '../ScreenTemplates/toTemplateSources';
import type { ResolvedUiProfile } from '../UiProfile/ResolvedUiProfile';
import type { UiProfileSettings } from '../UiProfile/UiProfileSettings';
import type { TemplateBrowserMode } from './TemplateBrowserMode';
import type { TemplateBrowserSources } from './TemplateBrowserContent';

/**
 * What the browser lists for an application: its own templates, and the templates of every blueprint package the build ships - the ones in the UI profile
 * and the ones that are not, which the browser shows as "Needs a blueprint" so they can be browsed before they are added.
 *
 * The packages are ordered so the ones in the profile come last, in the profile's override order: where two packages offer a template of one name, the one
 * the application would actually get is the one listed (the rule the whole UI profile follows).
 *
 * @param mode Where the browser is hosted.
 * @param settings The draft UI profile.
 * @param resolved The profile as Scene's resolver expands it.
 * @param bundles Every package the build has loaded.
 * @param applicationTemplates The templates built for the application.
 * @returns The sources the browser is made of, without a target.
 */
export function templateBrowserSources(mode: TemplateBrowserMode, settings: UiProfileSettings, resolved: ResolvedUiProfile, bundles: readonly ScenePackageBundle[], applicationTemplates: readonly ApplicationTemplate[]): TemplateBrowserSources {
    const active = new Set(resolved.selection.packages);
    const providing = bundles.filter(bundle => bundle.manifest.kind === PackageKind.Blueprint
        && ((bundle.screenTemplates?.length ?? 0) > 0 || (bundle.dialogTemplates?.length ?? 0) > 0 || (bundle.layouts?.length ?? 0) > 0));
    const inactive = providing.filter(bundle => !active.has(bundle.manifest.name));
    const inProfile = resolved.selection.packages.flatMap(name => providing.filter(bundle => bundle.manifest.name === name));
    const requiredBy = new Set(resolved.entries.filter(entry => entry.requiredBy.length > 0).map(entry => entry.name));

    return {
        mode,
        own: ownTemplateSource(applicationTemplates),
        blueprints: toTemplateSources([...inactive, ...inProfile]),
        bundles,
        profile: settings,
        active,
        requiredBy,
    };
}
