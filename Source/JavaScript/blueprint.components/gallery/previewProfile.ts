// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { PackageCatalog } from '@cratis/scene.engine';
import { corePackageManifest } from '@cratis/scene.react';
import { cratisComponentsPackageManifest } from '@cratis/scene.components';
import { defaultBlueprintManifest, defaultBlueprintName } from '@cratis/scene.blueprint.default';
import { ComponentName } from '../ComponentName';
import { componentsBlueprintName } from '../packageName';

/**
 * The names this blueprint borrows from `PrimeReact`.
 *
 * Every other package in the catalog below contributes its *real* manifest, because this package takes an
 * npm dependency on each of them. `PrimeReact` is the exception: this blueprint depends on it in the
 * manifest sense - `column` comes from there - without depending on its bundle, so its declaration is not
 * importable here and the borrowed names are written out instead.
 *
 * Every name below was checked against `primeReactPackage.ts`'s own component list rather than assumed.
 * The default blueprint learned why that matters when it referenced `chart` and `fileUpload`, which
 * neither library declares - names that look obvious and render as dashed red boxes.
 *
 * A host that has all five packages loaded should build this catalog from their manifests instead. The
 * shape is the same, and anything that has drifted then fails this blueprint's specs rather than a preview.
 */
export const primeReactComponentNames: string[] = ['column', 'dataTable', 'table', 'dialog', 'button', 'card', 'text', 'toolbar', 'dropdown', 'tooltip', 'menu', 'breadcrumb', 'sidebar'];

/**
 * The profile this blueprint's templates resolve against.
 *
 * Declaration order is ascending priority, which is why this exact order matters rather than being
 * cosmetic. `Cratis.Components` outranks `PrimeReact`, so a template naming `table` or `dialog` gets the
 * Arc-aware one and PrimeReact's is recorded as shadowed. Both blueprints outrank both libraries, so
 * `pageHeader` and `arcPageHeader` resolve to the packages that declare them. And this blueprint sits at
 * the top, which costs nothing today - it declares one name nobody else does - but is the correct place
 * for the package doing the layering.
 *
 * `core` is listed explicitly rather than left to `effectivePackages` to prepend, because a theme's
 * compatibility is checked against exactly what a profile declares, and a profile leaning on the implicit
 * fallback would make a theme look incompatible with a package the profile never admitted to using.
 *
 * Unlike the default blueprint, this package needs no separate *preview* profile. That blueprint takes no
 * npm dependency on the libraries its templates reference, so previewing it from its own package resolves
 * most names to implementations that are not loaded. This one depends on `@cratis/scene.components` and
 * `@cratis/scene.blueprint.default` for real, so everything its templates name is loadable except
 * PrimeReact's `column` - and a `column` never reaches the DOM at design time anyway, because the table it
 * belongs to is a placeholder until a host registers its query.
 */
export const componentsBlueprintProfile: UiProfile = {
    name: 'Arc pages',
    targetPlatform: 'web',
    packages: ['core', 'PrimeReact', cratisComponentsPackageManifest.name, defaultBlueprintName, componentsBlueprintName],
};

/**
 * The component catalog the templates resolve against.
 *
 * Four of the five entries are the owning package's real declared list, read straight off its manifest, so
 * a name renamed upstream fails a spec here instead of rendering as a dashed box in someone's application.
 */
export const componentsBlueprintCatalog: PackageCatalog = {
    [corePackageManifest.name]: corePackageManifest.components,
    PrimeReact: primeReactComponentNames,
    [cratisComponentsPackageManifest.name]: cratisComponentsPackageManifest.components,
    [defaultBlueprintName]: defaultBlueprintManifest.components,
    [componentsBlueprintName]: Object.values(ComponentName),
};
