// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from './ColorScheme';
import { LayoutMode } from './LayoutMode';
import { MenuTheme } from './MenuTheme';

/**
 * Everything the shell needs to know about itself, in one place.
 *
 * The shell has a lot of visual state - eight modes, a sidebar that can be open, hovered or pinned, a
 * mobile breakpoint that overrides the chosen mode, two color axes - and every one of those was, in the
 * template line this follows, a separate boolean scattered across components. Holding it as one plain
 * value instead means the whole state machine is pure functions over this record
 * (`layoutConfigTransitions.ts`), testable without React, and rendered by exactly one function
 * ({@link layoutWrapperClasses}).
 */
export interface LayoutConfigState {
    /** The mode the user chose. Below the mobile breakpoint the shell renders a different one - see {@link effectiveLayoutMode}. */
    mode: LayoutMode;

    /** How the sidebar surface is tinted. */
    menuTheme: MenuTheme;

    /** The light/dark axis. The host maps this onto a {@link Theme}; the shell only records it. */
    colorScheme: ColorScheme;

    /** The name of the {@link Theme} currently applied, so a theme switcher has something to reflect. */
    themeName: string;

    /**
     * Whether the sidebar currently occupies space (`static`) or floats over the content
     * (`overlay`, mobile). One flag rather than the separate desktop/mobile/overlay booleans the
     * template line uses - the mode already says how "open" should look.
     */
    isSidebarOpen: boolean;

    /** Whether a `reveal`/`drawer` sidebar is pinned open, so it stays out when the pointer leaves. */
    isSidebarAnchored: boolean;

    /** Whether a `reveal`/`drawer` sidebar is currently held out by the pointer. */
    isSidebarRevealed: boolean;

    /** Whether the viewport is below the mobile breakpoint. Never set by a user action - only by the viewport. */
    isMobile: boolean;
}
