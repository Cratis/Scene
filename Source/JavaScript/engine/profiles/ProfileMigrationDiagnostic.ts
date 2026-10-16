// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ProfileMigrationDiagnosticCode } from './ProfileMigrationDiagnosticCode';

/** One legacy value the migration could not map. */
export interface ProfileMigrationDiagnostic {
    /** The engine-owned code. */
    code: ProfileMigrationDiagnosticCode;

    /** The legacy value the problem is about (a layout, blueprint, template name, colour scheme or navigation mode). */
    subject?: string;

    /** The human message; it carries real names, never ids. */
    message: string;
}

/** The outcome of migrating a legacy profile. */
export interface ProfileMigration {
    /** The profile in the new shape: root, appearance and defaults filled in, the legacy `layout` gone once the root replaces it. */
    profile: UiProfile;

    /** Whether the migrated profile differs from the one that came in. Always false for a profile that is already migrated. */
    changed: boolean;

    /** What could not be mapped. The profile is still returned, with the unmapped legacy values left where they were. */
    diagnostics: ProfileMigrationDiagnostic[];
}
