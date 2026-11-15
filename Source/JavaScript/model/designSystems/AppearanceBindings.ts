// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Which token roles a profile's accent, corner style and font replace. A design system owns this because it alone knows which
 * of its tokens is the accent: Scene never assumes a token name.
 */
export interface AppearanceBindings {
    /** The color role the accent replaces (for example `color.primary`). Absent when the accent cannot be replaced. */
    accent?: string;

    /** The shadow role derived from the accent as the keyboard focus indicator. Absent for none. */
    focusRing?: string;

    /** The radius role the corner style replaces. Absent when corners cannot be replaced. */
    corners?: string;

    /** The font role the profile's font replaces. Absent when the font cannot be replaced. */
    font?: string;
}

export const AppearanceBindingsPropertyNames: (keyof AppearanceBindings)[] = ['accent', 'focusRing', 'corners', 'font'];
