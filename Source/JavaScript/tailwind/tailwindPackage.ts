// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';

/**
 * The Tailwind styling package's declaration.
 *
 * A styling package contributes no components of its own. It exists so a `ui profile` can state which
 * utility CSS system its component libraries are written against, and so those libraries can declare a
 * dependency on it rather than silently assuming it is loaded. Selecting a component library whose
 * components are full of Tailwind utility classes into a profile that never activated Tailwind produces
 * an application that renders unstyled - a real failure, and one worth catching when the profile is
 * configured rather than when someone opens the page.
 */
export const tailwindPackageManifest: ScenePackage = {
    name: 'Tailwind',
    version: '4.3.3',
    kind: PackageKind.Styling,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
    displayName: 'Tailwind CSS',
    description: 'Utility-first CSS. The styling system Cratis Components and the default layouts are written against.',
    module: '@cratis/scene.tailwind',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};

/**
 * The Tailwind styling package as a loadable bundle.
 */
export const tailwindPackage: ScenePackageBundle = {
    manifest: tailwindPackageManifest,
    components: {},
};
