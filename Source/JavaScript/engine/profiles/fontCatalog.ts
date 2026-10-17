// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where a font's files come from. */
export enum FontSource {
    /** Shipped with the application itself. */
    Bundled = 'Bundled',

    /** Loaded from a font host by the stylesheet in {@link FontChoice.stylesheet}. */
    Hosted = 'Hosted',

    /** Already on the user's system; nothing is loaded. */
    System = 'System',
}

/** One font an application can choose, with where it comes from and under what license. */
export interface FontChoice {
    /** The id stored in `appearance.font`. */
    id: string;

    displayName: string;

    /** The CSS `font-family` value the `text.fontFamily` token takes, ending in a generic fallback so a font that fails to load still renders. */
    family: string;

    source: FontSource;

    /** For a hosted font, the stylesheet a host loads to get it. */
    stylesheet?: string;

    license: string;
    licenseUrl?: string;
}

/** The line every host shows under a font in a picker: digits and letters together, so fonts that differ in their numerals look different. */
export const fontSampleLine = 'Orders shipped this week: 1 284';

/** The id of the font that stands in for any font that is not available. */
export const systemFontId = 'system-ui';

/** The fonts an application can choose. */
export const fontCatalog: readonly FontChoice[] = [
    {
        id: 'inter', displayName: 'Inter', family: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif", source: FontSource.Hosted,
        stylesheet: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        license: 'SIL Open Font License 1.1', licenseUrl: 'https://github.com/rsms/inter/blob/master/LICENSE.txt',
    },
    {
        id: 'ibm-plex-sans', displayName: 'IBM Plex Sans', family: "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif", source: FontSource.Hosted,
        stylesheet: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
        license: 'SIL Open Font License 1.1', licenseUrl: 'https://github.com/IBM/plex/blob/master/LICENSE.txt',
    },
    {
        id: 'source-serif-4', displayName: 'Source Serif 4', family: "'Source Serif 4', Georgia, 'Times New Roman', serif", source: FontSource.Hosted,
        stylesheet: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap',
        license: 'SIL Open Font License 1.1', licenseUrl: 'https://github.com/adobe-fonts/source-serif/blob/main/LICENSE.md',
    },
    {
        id: systemFontId, displayName: 'System UI', family: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", source: FontSource.System,
        license: 'Provided by the operating system',
    },
];
