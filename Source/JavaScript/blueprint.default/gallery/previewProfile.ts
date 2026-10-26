// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';
import { PackageCatalog } from '@cratis/scene.engine';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintName } from '../packageName';
import { coreComponentNames, cratisComponentsNames, primeReactComponentNames } from './dependencyComponentNames';

/**
 * The profile the gallery is previewed against.
 *
 * `core` is listed explicitly rather than left to `effectivePackages` to prepend, because a theme's
 * compatibility is checked against exactly what the profile declares - and a profile that leans on the
 * implicit fallback would make a theme look incompatible with a package the profile never admitted to
 * using. Declaration order is ascending priority, so this blueprint's own names win over the component
 * libraries', which is what lets it provide a `breadcrumb` of its own without hiding PrimeReact's.
 */
export const galleryProfile: UiProfile = {
    name: 'Gallery',
    targetPlatform: 'web',
    packages: ['core', 'PrimeReact', 'Cratis.Components', defaultBlueprintName],
};

/**
 * The profile a *preview* resolves against, when only some of those packages are actually loaded (see {@link previewProfileFor}).
 *
 * Same four packages, different order, and the difference is deliberate. This blueprint takes no npm
 * dependency on the optional widget bundles - each borrowing template declares its own requirements - so a preview run from this package has `core` and this blueprint
 * implemented and nothing else. Ranking `core` above the two libraries means `text`, `button` and `card`
 * resolve to something that exists, and the preview shows real content instead of a wall of placeholders.
 *
 * Names only the libraries declare - `dataTable`, `timeline`, `tag` - still resolve to them, find no
 * implementation, and render as `UnresolvedComponent`'s dashed box naming what is missing. That is the
 * right outcome rather than a papered-over one: previewing a blueprint against half a profile *should*
 * look visibly incomplete. A preview whose registry implements all four packages uses {@link galleryProfile}
 * instead and sees the real widgets.
 */
export const galleryPreviewProfile: UiProfile = {
    name: 'Gallery preview',
    targetPlatform: 'web',
    packages: ['PrimeReact', 'Cratis.Components', 'core', defaultBlueprintName],
};

/**
 * The profile a preview resolves against for the registry it renders with.
 *
 * {@link galleryProfile} when every package it declares is implemented in the registry: this blueprint, core and
 * Cratis Components by at least one component, and PrimeReact by *every* component name the gallery borrows from it
 * (the catalog's PrimeReact subset), so PrimeReact's `text` and `card` win over core's. Otherwise
 * {@link galleryPreviewProfile}, which keeps partial bundles resolving to what exists. A package that is only partly
 * registered must not win a name it cannot render, or the preview would show placeholders.
 */
export const previewProfileFor = (registry: ComponentRegistry): UiProfile => {
    const keys = Object.keys(registry);
    const loaded = (name: string) => keys.some(key => key.startsWith(componentRegistryKey(name, '')));
    const primeReactComplete = primeReactComponentNames.every(name => componentRegistryKey('PrimeReact', name) in registry);
    return galleryProfile.packages.every(loaded) && primeReactComplete ? galleryProfile : galleryPreviewProfile;
};

/**
 * The component catalog the gallery resolves against.
 *
 * This blueprint's own entry is its real declared component list; the other three are the subsets it
 * borrows, each name checked against the owning package's own manifest (see `dependencyComponentNames.ts`).
 * A host that has all four packages loaded should build this from their manifests instead - the shape is
 * the same, and anything that has drifted then fails this blueprint's specs rather than a preview.
 */
export const galleryComponentCatalog: PackageCatalog = {
    core: coreComponentNames,
    PrimeReact: primeReactComponentNames,
    'Cratis.Components': cratisComponentsNames,
    [defaultBlueprintName]: Object.values(ComponentName),
};
