// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One picture of a screen. */
export interface PreviewImage {
    /** Which version it shows - `active` or `draft`. */
    version: 'active' | 'draft';

    /** The color mode - `light` or `dark`. */
    mode: 'light' | 'dark';

    /** Where the picture is served from. */
    image: string;
}

/** One screen of the design system, drawn with the active version and with the draft. */
export interface ScreenPreview {
    /** The screen - `layout:Name`, `screen:Module.Template` or `dialog:Module.Template`. */
    screen: string;

    /** What it is called. */
    name: string;

    /** Whether the draft draws it differently from the active version. */
    different: boolean;

    /** Whether the draft draws it in a way that breaks - text that cannot be read, a token that is gone, or a drawing that failed. */
    broken: boolean;

    /** What is wrong with it in the draft. */
    problems: string[];

    /** The pictures - the active version and the draft, light and dark. */
    images: PreviewImage[];
}

/**
 * How the draft of a design system looks on its screens next to the active version - what the draft review shows, so a person
 * sees how many screens change and how many break before activating.
 */
export interface DesignSystemPreview {
    /** How many screens the draft draws differently. */
    different: number;

    /** How many screens the draft breaks. */
    broken: number;

    /** The screens. */
    screens: ScreenPreview[];

    /** Why nothing could be shown - empty when the screens are. */
    problem: string;
}
