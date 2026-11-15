// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageEditKind } from './PackageEditKind';
import { UiProfileSettings } from './UiProfileSettings';

/** The result of one edit to the package selection. */
export interface PackageEditOutcome {
    /** The settings after the edit - the same settings when nothing changed or the edit was blocked. */
    settings: UiProfileSettings;

    /** What happened. */
    kind: PackageEditKind;

    /** The packages that require the edited one, when that is why it stayed or could not be removed. */
    requiredBy: string[];
}
