// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SizeClass } from '../sizeClasses';

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
    defaultSizeClass?: SizeClass;

    /**
     * The name of the {@link Layout} this profile renders inside — the application's base navigational
     * shell, normally provided by a blueprint in `packages`. Absent when the profile does not select one.
     */
    layout?: string;

    /**
     * The name of the {@link Theme} this profile applies, or absent when it selects none. A theme is only
     * meaningful relative to a set of packages, which is why it is chosen here rather than by a screen.
     */
    theme?: string;
}

export const UiProfilePropertyNames: (keyof UiProfile)[] = [
    'name',
    'targetPlatform',
    'packages',
    'defaultSizeClass',
    'layout',
    'theme',
];
