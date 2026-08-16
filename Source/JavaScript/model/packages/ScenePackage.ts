// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageDependency } from './PackageDependency';
import { PackageKind } from './PackageKind';

/**
 * What a {@link UiProfile}'s `packages` entry actually names. A profile lists packages by name only;
 * this is the declaration behind the name - what it contributes, and what else has to be active for it
 * to work.
 */
export interface ScenePackage {
    /**
     * The name a {@link UiProfile} lists, and the name a {@link PackageDependency} refers to.
     */
    name: string;

    /**
     * The package's own version, so a {@link PackageDependency.versionRange} has something to check against.
     */
    version: string;

    /**
     * What the package contributes.
     */
    kind: PackageKind;

    /**
     * Other packages that must be active in the same profile for this one to work.
     */
    dependencies: PackageDependency[];

    /**
     * The component names this package declares - the catalog entry {@link UiProfile} resolution walks.
     */
    components: string[];

    /**
     * The names of the {@link Layout}s this package provides — an application's base navigational shells.
     * Empty for anything that is not a {@link PackageKind.Blueprint}.
     */
    layouts: string[];

    /**
     * The names of the {@link ScreenTemplate}s this package provides — the shapes that go inside a layout,
     * at module, feature and slice level.
     */
    screenTemplates: string[];

    /**
     * The names of the {@link DialogTemplate}s this package provides.
     */
    dialogTemplates: string[];

    /**
     * The names of the {@link Theme}s this package ships, empty for a package that ships none.
     */
    themes: string[];

    /**
     * A human-readable name for a package picker, falling back to `name` when absent.
     */
    displayName?: string;

    /**
     * A one-line description for a package picker.
     */
    description?: string;

    /**
     * The module that implements the package - an npm package name for a web renderer. Design-time
     * tooling needs it to know what to import; the model itself never loads anything.
     */
    module?: string;
}

export const ScenePackagePropertyNames: (keyof ScenePackage)[] = [
    'name',
    'version',
    'kind',
    'dependencies',
    'components',
    'layouts',
    'screenTemplates',
    'dialogTemplates',
    'themes',
    'displayName',
    'description',
    'module',
];
