// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';

/**
 * A UI profile as it was kept before the root template: the profile itself - which may carry the legacy `layout` name - and the
 * settings the Studio workspace kept next to it as separate fields. Everything but `profile` is optional; an absent value
 * means "not set".
 */
export interface LegacyProfile {
    /** The profile as read; its `layout` is the legacy shell name. */
    profile: UiProfile;

    /** The blueprint package the Studio workspace named as the application's shell (its legacy `Shell`). */
    shell?: string;

    /** The layout name the Studio workspace kept; takes precedence over `profile.layout` when both are set. */
    layout?: string;

    /** The navigation mode (menu mode) of the shell, such as `Sidebar`. It becomes the root template's `navigationMode` option. */
    navigationMode?: string;

    /** `Light`, `Dark` or `System`, in any case. It becomes the profile's appearance. */
    colorScheme?: string;

    /** The accent colour. It becomes the profile's appearance. */
    accent?: string;

    /** The name of the screen template new screens start from. It becomes `defaults.newScreenTemplate`. */
    defaultScreenTemplate?: string;
}
