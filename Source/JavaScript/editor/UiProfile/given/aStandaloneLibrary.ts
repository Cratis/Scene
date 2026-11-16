// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';

/**
 * A component library nothing else depends on and that depends only on core, declaring the given bare
 * component names - the smallest package a spec can add, remove and reorder without disturbing the real
 * dependency graph.
 */
export function aStandaloneLibrary(name: string, components: string[] = []): ScenePackageBundle {
    return {
        manifest: {
            name,
            version: '1.0.0',
            kind: PackageKind.ComponentLibrary,
            dependencies: [{ name: 'core' }],
            components,
            layouts: [],
            screenTemplates: [],
            dialogTemplates: [],
            themes: [],
        },
        components: {},
    };
}

/** Every real package bundle plus the given extras. */
export function bundlesWith(...extras: ScenePackageBundle[]): ScenePackageBundle[] {
    return [...blueprintPreviewBundles, ...extras];
}
