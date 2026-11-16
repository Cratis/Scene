// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, LayoutMode } from '@cratis/scene.blueprint.default';
import type { CornerStyle, ProfileIdentity, RootTemplate } from '@cratis/scene.model';
import type { SampleDataSelectionSettings } from './SampleDataSelectionSettings';
import type { ProfileSizeClass } from './ProfileSizeClass';

/**
 * The choices that make up an application's UI profile - what a draft edits and what applying persists.
 *
 * Only the choices are stored. Which packages those choices pull in, in what order and why is always
 * recomputed by Scene's resolver (`resolveUiProfile`), so a stored profile can never disagree with the
 * packages it names about what they require.
 */
export interface UiProfileSettings {
    /**
     * The packages chosen explicitly - component libraries, styling, and any other group such as icons -
     * in ascending override priority. `core` is never listed: it is always the final fallback.
     */
    packages: string[];

    /** The blueprint supplying the application shell, or empty when none is chosen. For a root template that is the blueprint's, it names that blueprint. */
    shell: string;

    /**
     * The application's root template - its shell - and the options the shell is given. Absent for a profile that only names a blueprint
     * (`shell`): the blueprint's first layout is then the shell. Scene's `resolveEffectiveShell` reads the same shape.
     */
    root?: RootTemplate;

    /** Further blueprints whose reusable templates are available without changing the shell. */
    templatePacks: string[];

    /** The name of the theme, or empty to take the first one compatible with the profile. */
    theme: string;

    /** Whether the shell renders light or dark. */
    colorScheme: ColorScheme;

    /** How the shell lays out its navigation. */
    navigationMode: LayoutMode;

    /** An accent color as `#rrggbb`, or empty to keep the theme's own. */
    accent: string;

    /** The application's name and logo as Scene models them. Absent for a profile that never chose one: initials taken from the name, name shown. */
    identity?: ProfileIdentity;

    /** The corner style. Absent to keep the theme's own corners. */
    corners?: CornerStyle;

    /** The id of a font of Scene's font catalog. Absent to keep the theme's own font. */
    font?: string;

    /** The menu surface: `light`, `dark` or `primary` (the accent). Absent for light. Stored with the shell's options. */
    menuTheme?: string;

    /** The screen template new screens start from, or empty for none. Chosen per level by Cratis/StudioIssues#396. */
    defaultScreenTemplate: string;

    /**
     * The size class the application assumes by default (`target size` of the Screenplay `ui profile`). Stored apart from the profile (its own event),
     * like the sample data choice. Absent for a profile that never chose one.
     */
    sizeClass?: ProfileSizeClass;

    /**
     * The sample data every preview and run of the application uses: chosen once here (the user's own pack or a blueprint's)
     * and inherited everywhere, never per screen. Absent for a profile stored before sample data existed: generated data.
     */
    sampleData?: SampleDataSelectionSettings;
}
