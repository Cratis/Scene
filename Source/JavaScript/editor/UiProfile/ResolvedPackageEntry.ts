// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { PackageInclusion } from './PackageInclusion';

/** One package of the resolved profile, with the reason it is there. */
export interface ResolvedPackageEntry {
    /** The package name. */
    name: string;

    /** The name to show: the manifest's display name, else the package name. */
    displayName: string;

    /** The manifest's one-line description, when it has one. */
    description?: string;

    /** The package's version. */
    version: string;

    /** What the package contributes. */
    kind: PackageKind;

    /** Why the package is present. */
    inclusion: PackageInclusion;

    /** The other resolved packages that declare a dependency on this one, in resolved order. */
    requiredBy: string[];
}
