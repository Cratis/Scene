// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataSelection } from '../sampleData';
import { ProfileAppearance } from './ProfileAppearance';
import { ProfileDefaults } from './ProfileDefaults';
import { ProfileIdentity } from './ProfileIdentity';
import { RootTemplate } from './RootTemplate';
import { TargetSizeClass } from '../sizeClasses';

/**
 * A named target: a platform, a default size class, an ordered list of component packages, and the
 * application shell and visual theme it selects. Declaration order in `packages` is override priority — a
 * later package shadows an earlier one when both resolve the same bare component name. `core` is always
 * the final fallback, so a minimum vocabulary resolves regardless of which packages a profile lists.
 *
 * A profile is where the choices that make a description concrete are made: which component vocabulary,
 * which shell, which theme. Deliberately none of them are stated by a {@link Screen} — that is what keeps
 * a screen portable across targets, and what lets one application ship a different shell to the web than
 * to a phone.
 */
export interface UiProfile {
    /**
     * The profile's name.
     */
    name: string;

    /**
     * The platform this profile targets (e.g. `web`, `ios`, `android`, `desktop`).
     */
    targetPlatform: string;

    /**
     * The component packages this profile draws from, in override-priority order.
     */
    packages: string[];

    /**
     * The size class assumed when the renderer cannot otherwise determine one.
     */
    defaultSizeClass?: TargetSizeClass;

    /**
     * The name of the {@link Layout} this profile renders inside — the application's base navigational
     * shell, normally provided by a blueprint in `packages`. Absent when the profile does not select one.
     * Legacy: still readable, superseded by {@link UiProfile.root}.
     */
    layout?: string;

    /**
     * The name of the {@link Theme} this profile applies, or absent when it selects none. A theme is only
     * meaningful relative to a set of packages, which is why it is chosen here rather than by a screen.
     */
    theme?: string;

    /**
     * Which sample data the application previews with at design and preview time: the active pack, chosen
     * once here for the whole application (own or from a blueprint), plus the rare shape-to-read-model
     * mappings and per-read-model pack bindings. Never stated by a screen, slice or component, and never
     * part of a production build. Absent selects the blueprint's default pack, then generated data.
     */
    sampleData?: SampleDataSelection;

    /**
     * The application's root template (its shell): a template reference - own or blueprint, with a version pin - and the
     * shell's own options. Supersedes {@link UiProfile.layout}; absent falls back to `layout` and then to the blueprint's
     * default shell.
     */
    root?: RootTemplate;

    /** The colour scheme, accent colour, corner style and font the application presents. Absent keeps the theme's defaults. */
    appearance?: ProfileAppearance;

    /** Application-wide authoring defaults such as the template new screens start from. Absent for none. */
    defaults?: ProfileDefaults;

    /** The application's name and logo, set once and drawn by every blueprint. Absent uses the host's application name and initials taken from it. */
    identity?: ProfileIdentity;
}

export const UiProfilePropertyNames: (keyof UiProfile)[] = [
    'name',
    'targetPlatform',
    'packages',
    'defaultSizeClass',
    'layout',
    'theme',
    'sampleData',
    'root',
    'appearance',
    'defaults',
    'identity',
];
