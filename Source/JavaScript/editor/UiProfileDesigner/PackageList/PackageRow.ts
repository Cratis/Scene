// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PackageGroupId } from '../../UiProfile/PackageGroupId';
import type { PackageInclusion } from '../../UiProfile/PackageInclusion';

// One package of the profile as the Packages list shows it. The list is in priority order, the package that wins a shared component name first.
export interface PackageRow {
    name: string;
    displayName: string;
    version: string;

    // What the package is for (component library, styling, icon library, blueprint). Undefined for a kind the designer has no group for.
    role: PackageGroupId | undefined;

    // How it came to be in the profile: always (core), chosen here, or pulled in by another package.
    inclusion: PackageInclusion;
    requiredBy: string[];

    // 1 is the package that wins when two supply the same component.
    priority: number;

    // Whether the author chose it as a package (so it can be moved and removed here), rather than it being the shell or a template pack.
    isPackage: boolean;
    isShell: boolean;
    isTemplatePack: boolean;
    canRaise: boolean;
    canLower: boolean;
}
