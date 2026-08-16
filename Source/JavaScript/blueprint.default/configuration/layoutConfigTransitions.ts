// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from './ColorScheme';
import { LayoutConfigState } from './LayoutConfigState';
import { LayoutMode } from './LayoutMode';
import { MenuTheme } from './MenuTheme';

/**
 * The viewport width, in CSS pixels, below which the shell stops honoring the chosen {@link LayoutMode}
 * and forces the off-canvas one. 991 is the breakpoint the PrimeTek template line uses throughout; the
 * value is exported rather than buried in a media query so the resize listener and the stylesheet cannot
 * disagree about where the boundary is.
 */
export const mobileBreakpoint = 991;

/** The media query the shell watches to know whether it is in the mobile regime. */
export const mobileMediaQuery = `(max-width: ${mobileBreakpoint}px)`;

/**
 * Whether a viewport width falls in the mobile regime. Inclusive of the breakpoint itself, so this and
 * {@link mobileMediaQuery}'s `max-width` agree on the boundary rather than disagreeing by one pixel.
 */
export function isMobileWidth(width: number): boolean {
    return width <= mobileBreakpoint;
}

/**
 * The state a shell starts in when nothing has been persisted: the docked sidebar every application
 * template defaults to, on a light scheme, with the theme this package ships as its light one.
 */
export function defaultLayoutConfigState(): LayoutConfigState {
    return {
        mode: LayoutMode.Static,
        menuTheme: MenuTheme.Light,
        colorScheme: ColorScheme.Light,
        themeName: 'Scene Default Light',
        isSidebarOpen: true,
        isSidebarAnchored: false,
        isSidebarRevealed: false,
        isMobile: false,
    };
}

/**
 * The mode the shell actually renders, as opposed to the one the user picked.
 *
 * Below the mobile breakpoint every mode collapses to {@link LayoutMode.Overlay}: a docked 18rem sidebar,
 * an icon rail or a horizontal menu strip are all unusable on a phone, so the template line forces
 * off-canvas there and hides the mode picker. Deriving it rather than overwriting `mode` is what lets the
 * chosen mode come back untouched when the viewport grows again.
 */
export function effectiveLayoutMode(state: LayoutConfigState): LayoutMode {
    return state.isMobile ? LayoutMode.Overlay : state.mode;
}

/** Whether the mode keeps the sidebar off-canvas until something opens it. */
export function isOffCanvasMode(mode: LayoutMode): boolean {
    return mode === LayoutMode.Overlay;
}

/** Whether the mode is one of the two that react to the pointer - `reveal` slides in, `drawer` grows. */
export function isPointerRevealMode(mode: LayoutMode): boolean {
    return mode === LayoutMode.Reveal || mode === LayoutMode.Drawer;
}

/**
 * Chooses a different mode.
 *
 * Switching also resets the sidebar's transient state, because "open" means something different in each
 * mode: a static sidebar starts docked, every other mode starts closed, and a reveal/drawer panel that
 * was hovered out must not stay out under a mode that has no hover behavior. The pin survives, since it
 * is a preference rather than transient state.
 */
export function withMode(state: LayoutConfigState, mode: LayoutMode): LayoutConfigState {
    return { ...state, mode, isSidebarOpen: mode === LayoutMode.Static, isSidebarRevealed: false };
}

/**
 * Records that the viewport crossed the mobile breakpoint.
 *
 * Entering the mobile regime closes the sidebar so the page is not covered on arrival; leaving it
 * restores whatever the chosen mode considers its resting state. Both directions are recomputed rather
 * than remembered, so a mode switch made while mobile still lands correctly on the way back out.
 */
export function withMobile(state: LayoutConfigState, isMobile: boolean): LayoutConfigState {
    if (state.isMobile === isMobile) {
        return state;
    }

    return {
        ...state,
        isMobile,
        isSidebarOpen: isMobile ? false : state.mode === LayoutMode.Static,
        isSidebarRevealed: false,
    };
}

/** Opens or closes the sidebar. */
export function withSidebarOpen(state: LayoutConfigState, isSidebarOpen: boolean): LayoutConfigState {
    return { ...state, isSidebarOpen };
}

/** Flips the sidebar between open and closed - what the topbar's menu button does in every mode. */
export function toggleSidebar(state: LayoutConfigState): LayoutConfigState {
    return withSidebarOpen(state, !state.isSidebarOpen);
}

/**
 * Holds a `reveal`/`drawer` sidebar out, or lets it fall back.
 *
 * An anchored sidebar ignores the pointer entirely - that is the whole point of pinning it - so this is a
 * no-op while {@link LayoutConfigState.isSidebarAnchored} is set rather than something the pointer can
 * fight with.
 */
export function withSidebarRevealed(state: LayoutConfigState, isSidebarRevealed: boolean): LayoutConfigState {
    if (state.isSidebarAnchored) {
        return state;
    }

    return { ...state, isSidebarRevealed };
}

/**
 * Pins or unpins a `reveal`/`drawer` sidebar. Pinning implies revealed, so the panel does not snap shut
 * the moment the pointer leaves the pin button that just pinned it.
 */
export function withSidebarAnchored(state: LayoutConfigState, isSidebarAnchored: boolean): LayoutConfigState {
    return { ...state, isSidebarAnchored, isSidebarRevealed: isSidebarAnchored };
}

/** Flips the pin - what the sidebar's anchor button does. */
export function toggleSidebarAnchor(state: LayoutConfigState): LayoutConfigState {
    return withSidebarAnchored(state, !state.isSidebarAnchored);
}

/** Chooses the light/dark axis. */
export function withColorScheme(state: LayoutConfigState, colorScheme: ColorScheme): LayoutConfigState {
    return { ...state, colorScheme };
}

/** Chooses how the sidebar surface is tinted. */
export function withMenuTheme(state: LayoutConfigState, menuTheme: MenuTheme): LayoutConfigState {
    return { ...state, menuTheme };
}

/** Records which {@link Theme} is applied, so a theme switcher reflects the truth after a host-driven change. */
export function withThemeName(state: LayoutConfigState, themeName: string): LayoutConfigState {
    return { ...state, themeName };
}
