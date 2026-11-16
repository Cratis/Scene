// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What one authored screen relies on, supplied by whoever owns authored screens.
 *
 * The UI Profile page does not author screens and Studio stores none today, so the page receives usages
 * from its host rather than reading them. The screen editor (Cratis/StudioIssues#394) provides them; with
 * none, applying has nothing existing to protect.
 */
export interface ProfileUsage {
    /** The screen, as the user knows it. */
    screen: string;

    /** The layouts the screen is placed in. */
    layouts: string[];

    /** The screen templates the screen is built from. */
    screenTemplates: string[];

    /** The dialog templates the screen summons. */
    dialogTemplates: string[];

    /** The bare component names the screen uses. */
    components: string[];

    /** The slots the screen fills, as the layout or template that declares each, and the slot's name. */
    slots: { owner: string; slot: string }[];
}
