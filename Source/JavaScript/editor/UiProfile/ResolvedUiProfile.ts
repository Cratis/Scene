// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiProfile } from '@cratis/scene.model';
import { ComponentResolution, PackageSelection } from '@cratis/scene.engine';
import { ResolvedPackageEntry } from './ResolvedPackageEntry';

/** What a {@link UiProfileSettings} amounts to once Scene's resolver has expanded and ordered it. */
export interface ResolvedUiProfile {
    /** The resolver's own outcome: the ordered packages, what it added, and everything wrong. */
    selection: PackageSelection;

    /** The Scene profile preview, screen editor and Play render through. */
    profile: UiProfile;

    /** The resolved packages in override-priority order, each with its reason. */
    entries: ResolvedPackageEntry[];

    /** Every bare component name more than one active package declares, and which one wins it. */
    collisions: ComponentResolution[];

    /** The themes compatible with every package of the profile. */
    compatibleThemes: Theme[];

    /** The layout of the chosen shell, or empty when there is no usable shell. */
    layout: string;

    /** Whether the resolver found nothing missing, conflicting or cyclic. */
    isValid: boolean;
}
