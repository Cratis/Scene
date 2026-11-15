// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconUsage } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';
import { ApplicationTemplate } from '../ScreenTemplates/ApplicationTemplate';
import { ApplyUiProfileResult } from './ApplyUiProfileResult';
import { PersistedUiProfile } from './PersistedUiProfile';
import type { SampleDataPack } from '@cratis/scene.model';
import { ProfileUsage } from './ProfileUsage';
import { SampleDataSelectionSettings } from './SampleDataSelectionSettings';
import { UiProfileSettings } from './UiProfileSettings';

/** What the workspace needs from its host. */
export interface UiProfileWorkspaceInput {
    /**
     * The profile stored for the application, or `undefined` when none has been applied yet - the
     * workspace then starts from the default profile and says so.
     */
    applied?: UiProfileSettings;

    /** Every package bundle the build has loaded. */
    bundles: ScenePackageBundle[];

    /** What existing screens rely on, so applying can refuse to break them. */
    usages: ProfileUsage[];

    /** The screen templates built for the application, which are valid choices for the default template alongside the blueprints'. */
    applicationTemplates: ApplicationTemplate[];

    // Icon references every authored saved screen uses. A profile change is blocked while the host is unable to read them.
    iconUsages?: IconUsage[];

    // The status of loading every authored screen/template. Zero usages are trusted only after this is no longer loading and has no error.
    usageInspection?: { isLoading: boolean; error?: string };

    // Bundles the applied profile used, so an icon-library version change has an accurate before catalog.
    appliedBundles?: ScenePackageBundle[];

    /**
     * The application's own sample data: the packs it has made or imported, the read models a pack's shapes may stand in for, and
     * how to save, import and remove a pack. Absent where the host cannot store packs; the selector then offers only what the
     * blueprints ship and the generated data.
     */
    sampleData?: {
        packs: SampleDataPack[];
        readModels: string[];
        onSavePack: (pack: SampleDataPack) => Promise<ApplyUiProfileResult>;
        onRemovePack: (id: string) => Promise<ApplyUiProfileResult>;
    };

    /** Stores the profile. Rejecting, or resolving unsuccessfully, keeps the draft. */
    onApply: (profile: PersistedUiProfile) => Promise<ApplyUiProfileResult>;

    /** Stores the sample data choice that goes with the profile; called after the profile when the choice changed. */
    onApplySampleData?: (selection: SampleDataSelectionSettings) => Promise<ApplyUiProfileResult>;
}
