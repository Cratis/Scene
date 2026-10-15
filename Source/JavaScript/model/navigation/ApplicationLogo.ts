// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The application's logo. It is defined at the application level only; a module shows it locked.
 */
export interface ApplicationLogo {
    /** The image reference. */
    image: string;

    /** The application name shown with or instead of the image. */
    title: string;
}

export const ApplicationLogoPropertyNames: (keyof ApplicationLogo)[] = ['image', 'title'];
