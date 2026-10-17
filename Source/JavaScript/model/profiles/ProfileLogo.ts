// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LogoKind } from './LogoKind';

/**
 * The application's logo. Every member is kept even when the {@link ProfileLogo.kind} does not use it, so switching the type
 * back shows what was entered before.
 */
export interface ProfileLogo {
    /** How the logo is made. Absent means initials. */
    kind?: LogoKind;

    /** Up to two characters for the initials logo. Empty or absent means the first letter of the name, upper-cased. */
    initials?: string;

    /** One of the closed set of logo icons (see `logoIcons` in the engine) for the icon logo. */
    icon?: string;

    /**
     * The image for the image logo, as a `data:` URI with base64 content (PNG, JPG, SVG or WebP, up to 400 KB of image data).
     * The image travels inline in the profile so it is stored and exported with it.
     */
    image?: string;
}

export const ProfileLogoPropertyNames: (keyof ProfileLogo)[] = ['kind', 'initials', 'icon', 'image'];
