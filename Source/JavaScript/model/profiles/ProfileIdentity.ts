// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileLogo } from './ProfileLogo';

/**
 * Who the application is: the name and the logo every blueprint draws, set once for the whole application. Switching the shell or the menu
 * mode never changes them; changing them changes every blueprint at once.
 */
export interface ProfileIdentity {
    /** The application name the shell shows. Absent means the host's application name. */
    name?: string;

    /** The logo. Absent means initials taken from the name. */
    logo?: ProfileLogo;

    /** Whether the name is shown beside the logo mark. Absent means it is shown. */
    showName?: boolean;
}

export const ProfileIdentityPropertyNames: (keyof ProfileIdentity)[] = ['name', 'logo', 'showName'];
