// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeMenuBehavior, normalizeNavigationMode, NavigationMode } from '@cratis/scene.engine';

/** The width at or below which a preview is a touch screen: the menu is a drawer there (Scene's mobile regime). */
export const touchWidth = 480;

export interface Regime {
    touch: boolean;

    /** The width class of the preview, as the status bar names it. */
    widthClass: 'compact' | 'regular';

    /** The note the status bar shows when the regime replaces the chosen mode, from Scene. */
    note?: string;
}

/**
 * Says which regime a preview of this width is in and what it does to the chosen menu mode. The rule and the words are Scene's
 * (`describeMenuBehavior`); the width that separates the regimes is the one the preview host lays out for.
 *
 * @param width The preview's width.
 * @param mode The chosen menu mode, as stored.
 * @returns The regime.
 */
export function regimeOf(width: number, mode: string | undefined): Regime {
    const touch = width <= touchWidth;
    const behavior = describeMenuBehavior(normalizeNavigationMode(mode) ?? NavigationMode.Static, touch);
    return { touch, widthClass: touch ? 'compact' : 'regular', ...(behavior.note === undefined ? {} : { note: behavior.note }) };
}
