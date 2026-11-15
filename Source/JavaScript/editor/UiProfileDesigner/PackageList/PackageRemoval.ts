// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ProfileBlocker } from '../../UiProfile/ProfileBlocker';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';

export enum PackageRemovalKind {
    // Nothing is lost: the package goes.
    Allowed = 'allowed',

    // The package is always there (core), or is not a package that can be removed here.
    Fixed = 'fixed',

    // Another package in the profile needs it, so it stays; the choice to have it is dropped (`settings`) and it carries on as a requirement.
    StillRequired = 'stillRequired',

    // Screens or the profile's own choices rely on what the package supplies.
    Breaks = 'breaks',
}

// What removing a package would do, worked out before anything changes so the author reads it instead of discovering it as a refused save.
export interface PackageRemovalPlan {
    kind: PackageRemovalKind;

    // The profile as it would be, when removing is allowed or the package stays because another needs it.
    settings: UiProfileSettings;

    // The packages that still need it (`StillRequired`).
    requiredBy: string[];

    // What would break, that does not already (`Breaks`).
    blockers: ProfileBlocker[];
}
