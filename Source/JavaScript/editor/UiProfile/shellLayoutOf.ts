// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';

/**
 * The layout a blueprint contributes as the application shell: the first one its manifest declares.
 *
 * @param bundles Every known package bundle.
 * @param shell The name of the blueprint.
 * @returns The layout name, or empty when the blueprint is unknown or declares no layout (a template-only
 * blueprint cannot be the shell).
 */
export function shellLayoutOf(bundles: ScenePackageBundle[], shell: string): string {
    return bundles.find(bundle => bundle.manifest.name === shell)?.manifest.layouts[0] ?? '';
}
