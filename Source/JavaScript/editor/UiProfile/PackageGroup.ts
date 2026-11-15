// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage } from '@cratis/scene.model';
import { PackageGroupId } from './PackageGroupId';

/** A kind of contribution the Packages pane groups together. */
export interface PackageGroup {
    /** The group, which also keys its labels in the host's strings. */
    id: PackageGroupId;

    /** Whether a package belongs to this group. */
    includes: (scenePackage: ScenePackage) => boolean;
}
