// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';

/**
 * The packages of a given kind.
 */
export function packagesOfKind(catalog: ScenePackage[], kind: PackageKind): ScenePackage[] {
    return catalog.filter((scenePackage) => scenePackage.kind === kind);
}

/**
 * The component libraries a profile can be founded on — the ones that do not themselves layer on another
 * component library.
 *
 * "Base" is not a declared property; it falls out of the dependency graph. PrimeReact depends on a
 * styling package but on no other component library, so it is a base. `@cratis/components` depends on
 * PrimeReact, so it is not — it is something you add on top of a base you already picked. Deriving it
 * this way means a third party shipping their own library gets classified correctly without having to
 * declare anything extra.
 */
export function baseComponentLibraries(catalog: ScenePackage[]): ScenePackage[] {
    const libraries = packagesOfKind(catalog, PackageKind.ComponentLibrary);
    const names = new Set(libraries.map((scenePackage) => scenePackage.name));
    return libraries.filter((scenePackage) => !scenePackage.dependencies.some((dependency) => names.has(dependency.name)));
}

/**
 * The packages that can be added to a selection without pulling anything else in — every dependency they
 * declare is already selected.
 *
 * This is the "what else works with what I have picked" list: choose PrimeReact and Tailwind, and
 * `@cratis/components` becomes available because both of its dependencies are now met. It is
 * deliberately stricter than {@link resolvePackageDependencies}, which will happily add the missing
 * dependencies for you — a picker wants to show what fits, not what would drag more in.
 */
export function availablePackagesFor(catalog: ScenePackage[], selected: string[]): ScenePackage[] {
    const chosen = new Set(selected);
    return catalog.filter(
        (scenePackage) => !chosen.has(scenePackage.name) && scenePackage.dependencies.every((dependency) => chosen.has(dependency.name))
    );
}

/**
 * Every component name the selected packages declare between them, without duplicates, sorted so a
 * component picker has a stable list to show.
 */
export function componentsForPackages(catalog: ScenePackage[], selected: string[]): string[] {
    const chosen = new Set(selected);
    const components = catalog.filter((scenePackage) => chosen.has(scenePackage.name)).flatMap((scenePackage) => scenePackage.components);
    return [...new Set(components)].sort();
}

/**
 * Builds the component-name catalog `resolveComponentName` resolves against.
 */
export function toComponentCatalog(catalog: ScenePackage[]): Record<string, string[]> {
    const components: Record<string, string[]> = {};
    for (const scenePackage of catalog) {
        components[scenePackage.name] = scenePackage.components;
    }

    return components;
}
