// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { areUiProfileSettingsEqual } from '../../UiProfile/areUiProfileSettingsEqual';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';

// What the designer edits: the profile's settings and the name of the application they belong to. The name is one of the Application node's
// settings, so it is one undo step and autosaved with the rest, even though the application (not the profile) stores it.
export type DesignedProfile = UiProfileSettings & { applicationName: string };

export function designedProfileOf(settings: UiProfileSettings, applicationName: string): DesignedProfile {
    return { ...settings, applicationName };
}

export function areDesignedProfilesEqual(left: DesignedProfile, right: DesignedProfile): boolean {
    return left.applicationName === right.applicationName && areUiProfileSettingsEqual(left, right);
}
