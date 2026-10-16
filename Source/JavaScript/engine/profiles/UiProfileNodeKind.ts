// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The nodes of the UI profile a designer edits, in the order it lists them. The values are the component names of their descriptors. */
export const UiProfileNodeKind = {
    /** The application: its name, platform, default size class and the template new screens start from. */
    Application: 'uiProfile:application',

    /** The shell: the root template and the options it exposes. */
    Shell: 'uiProfile:shell',

    /** The theme, colour scheme and accent. */
    Theme: 'uiProfile:theme',

    /** The packages the application uses. */
    Packages: 'uiProfile:packages',

    /** The sample data the preview shows. */
    SampleData: 'uiProfile:sampleData',
} as const;

export type UiProfileNodeKind = (typeof UiProfileNodeKind)[keyof typeof UiProfileNodeKind];
