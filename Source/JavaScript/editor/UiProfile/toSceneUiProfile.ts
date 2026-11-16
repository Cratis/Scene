// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { PersistedUiProfile } from './PersistedUiProfile';
import type { SampleDataSelectionSettings } from './SampleDataSelectionSettings';
import { toSceneSampleData } from './sampleDataOf';
import { uiProfileName } from './resolveUiProfile';

/**
 * Builds the Scene profile a stored UI profile stands for, without needing the package catalog.
 *
 * This is the one place a consumer other than the UI Profile page should turn the stored profile into a
 * Scene `UiProfile`, so the screen editor and anything else rendering a screen agree with the preview.
 *
 * @param persisted The stored profile.
 * @param sampleData The application's sample data choice, stored apart from the profile; absent when none was made.
 * @returns The Scene {@link UiProfile}.
 */
export function toSceneUiProfile(persisted: PersistedUiProfile, sampleData?: SampleDataSelectionSettings): UiProfile {
    return {
        name: uiProfileName,
        targetPlatform: 'web',
        packages: [...persisted.resolvedPackages],
        layout: persisted.layout.length > 0 ? persisted.layout : undefined,
        theme: persisted.theme.length > 0 ? persisted.theme : undefined,
        sampleData: toSceneSampleData(sampleData),
    };
}
