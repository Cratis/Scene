// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toSceneSampleData } from './sampleDataOf';
import { ColorScheme as ProfileColorScheme, TemplateReferenceSource, UiProfile } from '@cratis/scene.model';
import { corePackage, isPackageSelectionValid, resolvePackageDependencies, toComponentCatalog } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';
import { filterCompatibleThemes } from '../UiProfileDesigner/filterCompatibleThemes';
import { findComponentCollisions } from '../UiProfileDesigner/findComponentCollisions';
import { PackageInclusion } from './PackageInclusion';
import { ResolvedPackageEntry } from './ResolvedPackageEntry';
import { ResolvedUiProfile } from './ResolvedUiProfile';
import { UiProfileSettings } from './UiProfileSettings';
import { explicitPackageNames } from './explicitPackageNames';
import { shellLayoutOf } from './shellLayoutOf';
import { rootLayoutOf } from './rootLayoutOf';

/** The name of the Scene profile the workspace builds. */
export const uiProfileName = 'UI Profile';

/**
 * Expands the settings into the effective profile.
 *
 * Nothing here decides anything itself: `resolvePackageDependencies` expands and orders the packages,
 * `findComponentCollisions` (`resolveComponentName` over the catalog) says who wins each shared name and
 * `filterCompatibleThemes` narrows the themes. This function only records, per package, whether the user
 * chose it and which resolved packages need it - the part a picker has to explain.
 *
 * @param settings The settings to resolve.
 * @param bundles Every known package bundle.
 * @returns The {@link ResolvedUiProfile}.
 */
export function resolveUiProfile(settings: UiProfileSettings, bundles: ScenePackageBundle[]): ResolvedUiProfile {
    const catalog = bundles.map(bundle => bundle.manifest);
    const explicit = explicitPackageNames(settings);
    const selection = resolvePackageDependencies(explicit, catalog);
    const layout = rootLayoutOf(settings, bundles) ?? shellLayoutOf(bundles, settings.shell);
    const profile: UiProfile = {
        name: uiProfileName,
        targetPlatform: 'web',
        packages: selection.packages,
        layout: layout.length > 0 ? layout : undefined,
        ...(settings.root ? { root: settings.root } : {}),
        theme: settings.theme.length > 0 ? settings.theme : undefined,
        sampleData: toSceneSampleData(settings.sampleData),
        appearance: appearanceOf(settings),
        ...(settings.identity === undefined ? {} : { identity: settings.identity }),
    };
    const chosen = new Set(explicit);
    const entries = selection.packages.flatMap(name => {
        const manifest = catalog.find(candidate => candidate.name === name);
        if (!manifest) return [];
        const entry: ResolvedPackageEntry = {
            name,
            displayName: manifest.displayName ?? manifest.name,
            description: manifest.description,
            version: manifest.version,
            kind: manifest.kind,
            inclusion: name === corePackage ? PackageInclusion.Fallback : chosen.has(name) ? PackageInclusion.Explicit : PackageInclusion.Automatic,
            requiredBy: catalog
                .filter(other => selection.packages.includes(other.name) && other.dependencies.some(dependency => dependency.name === name))
                .map(other => other.name),
        };
        return [entry];
    });

    return {
        selection,
        profile,
        entries,
        collisions: findComponentCollisions(profile, toComponentCatalog(catalog)),
        compatibleThemes: filterCompatibleThemes(profile, bundles.flatMap(bundle => bundle.themes ?? [])),
        layout,
        isValid: isPackageSelectionValid(selection),
    };
}

/**
 * The look the profile chose, in Scene's own shape, so the preview draws exactly what Scene resolves: scheme, accent, corners and font. Empty when the
 * author chose none of them, which leaves the theme's own look.
 */
function appearanceOf(settings: UiProfileSettings): UiProfile['appearance'] {
    const chosen = {
        ...(settings.colorScheme === 'dark' ? { colorScheme: ProfileColorScheme.Dark } : {}),
        ...(settings.accent.length > 0 ? { accent: settings.accent } : {}),
        ...(settings.corners === undefined ? {} : { corners: settings.corners }),
        ...(settings.font === undefined ? {} : { font: settings.font }),
    };
    return Object.keys(chosen).length === 0 ? undefined : chosen;
}

/**
 * The profile the preview is drawn from: the resolved profile with the menu mode and menu theme the author chose in the root's options, which is where
 * Scene reads them. The stored root carries them only once the profile has been saved in the root-template shape, and a profile that chose no root has
 * none at all; the preview must follow the choice at once, so it is given a root of the layout it resolved to. Only the preview reads this profile.
 *
 * @param resolved The resolved profile.
 * @param settings The settings being designed.
 * @returns The profile to draw.
 */
export function previewProfileOf(resolved: ResolvedUiProfile, settings: UiProfileSettings): UiProfile {
    const root = resolved.profile.root ?? { template: { source: TemplateReferenceSource.Own, id: resolved.layout.length > 0 ? resolved.layout : 'AppShell' } };
    return {
        ...resolved.profile,
        root: {
            ...root,
            options: {
                ...root.options,
                navigationMode: settings.navigationMode,
                ...(settings.menuTheme === undefined ? {} : { menuTheme: settings.menuTheme }),
            },
        },
    };
}
