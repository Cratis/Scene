// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle } from '../packages';
import { coreComponents } from './coreComponents';

/**
 * The `core` package's declaration. Every other package is loaded by a host that reads its manifest;
 * `core` ships inside the renderer itself, because Scene#3 guarantees a bare name always has somewhere to
 * resolve regardless of which packages a profile lists. It is still declared the same way as any other -
 * a package picker should be able to show it, and the dependency resolver should be able to reason about
 * it, without a special case.
 */
export const corePackageManifest: ScenePackage = {
    name: 'core',
    version: '1.0.0',
    kind: PackageKind.ComponentLibrary,
    dependencies: [],
    components: ['text', 'button', 'card'],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
    displayName: 'Core',
    description: 'The built-in fallback vocabulary every ui profile resolves against.',
    module: '@cratis/scene.react',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};

/**
 * The `core` package as a loadable bundle.
 */
export const corePackage: ScenePackageBundle = {
    manifest: corePackageManifest,
    components: coreComponents,
};
