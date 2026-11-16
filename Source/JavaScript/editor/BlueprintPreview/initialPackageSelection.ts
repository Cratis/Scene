// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { baseComponentLibraries, packagesOfKind } from '@cratis/scene.engine';

/**
 * The selection the picker opens on: every base component library, every styling package, and the first
 * blueprint.
 *
 * It stops there rather than pre-picking the closure. The libraries that *layer* on a base - the ones the
 * blueprint declares a dependency on - are left to `resolvePackageDependencies` to add, so the page opens
 * already showing what dependency resolution did on the user's behalf. A picker that started from the
 * complete, already-closed selection would never demonstrate that, which is half of what this page exists
 * for.
 *
 * The bases and the styling packages *are* pre-picked, because every later stage is gated on them: leaving
 * them out would open the page with the interesting stage closed and nothing to click in it.
 *
 * @param catalog Every known package.
 * @returns The package names to start from.
 */
export function initialPackageSelection(catalog: ScenePackage[]): string[] {
    const styling = packagesOfKind(catalog, PackageKind.Styling).map(scenePackage => scenePackage.name);
    const blueprint = packagesOfKind(catalog, PackageKind.Blueprint)[0];

    // Scene counts a library as a base once it no longer builds on another library (Cratis.Components stopped depending on PrimeReact in 4.80).
    // What the blueprint depends on is still left to dependency resolution, whatever Scene calls it.
    const dependedOn = new Set(blueprint?.dependencies?.map(dependency => dependency.name) ?? []);
    const bases = baseComponentLibraries(catalog).map(scenePackage => scenePackage.name).filter(name => !dependedOn.has(name));

    return blueprint ? [...bases, ...styling, blueprint.name] : [...bases, ...styling];
}
