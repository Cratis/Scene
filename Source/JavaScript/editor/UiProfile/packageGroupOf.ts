// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage } from '@cratis/scene.model';
import { PackageGroup } from './PackageGroup';
import { packageGroups } from './packageGroups';

/**
 * The group a package belongs to.
 *
 * @param scenePackage The package.
 * @returns Its group, or `undefined` for a kind no group lists yet.
 */
export function packageGroupOf(scenePackage: ScenePackage): PackageGroup | undefined {
    return packageGroups.find(group => group.includes(scenePackage));
}
