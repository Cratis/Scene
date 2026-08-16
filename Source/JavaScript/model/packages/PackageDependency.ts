// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One package a {@link ScenePackage} needs present in the same {@link UiProfile} to work.
 * `@cratis/components` is written against PrimeReact and Tailwind, so it declares both - a profile
 * listing it without them is stating something that cannot render, and that has to be visible rather
 * than discovered at runtime.
 */
export interface PackageDependency {
    /**
     * The name of the package depended on, matching that package's `name`.
     */
    name: string;

    /**
     * An optional semver range the dependency must satisfy. Left undefined when any version will do -
     * which is the common case, since a profile only ever activates one version of a package.
     */
    versionRange?: string;
}

export const PackageDependencyPropertyNames: (keyof PackageDependency)[] = ['name', 'versionRange'];
