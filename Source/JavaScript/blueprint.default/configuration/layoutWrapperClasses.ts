// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutConfigState } from './LayoutConfigState';
import { LayoutMode } from './LayoutMode';
import { effectiveLayoutMode, isPointerRevealMode } from './layoutConfigTransitions';

/**
 * Turns the shell's state into the wrapper class list its stylesheet keys off - the single seam between
 * the state machine and the CSS.
 *
 * Every class name here is the one the PrimeTek template line already uses (`layout-static`,
 * `layout-overlay-active`, `layout-sidebar-anchored`, `layout-mobile-active`, ...), so a stylesheet
 * written against those templates keeps working and anyone who has themed one can read this shell's DOM
 * without a translation table.
 *
 * The mode class reflects the *effective* mode, so the off-canvas rules a phone needs come from the same
 * `layout-overlay` block a desktop overlay uses instead of a parallel mobile-only ruleset. The chosen mode
 * is still emitted separately as `data-layout-mode`, so a configurator can show what the user picked even
 * while the viewport overrides it.
 *
 * @param state The current shell state.
 * @returns The classes to put on the shell's wrapper element, always starting with `layout-wrapper`.
 */
export function layoutWrapperClasses(state: LayoutConfigState): string[] {
    const mode = effectiveLayoutMode(state);
    const classes = [
        'layout-wrapper',
        `layout-${mode}`,
        `layout-menu-${state.menuTheme}`,
        `layout-color-scheme-${state.colorScheme}`,
    ];

    if (mode === LayoutMode.Static && !state.isSidebarOpen) {
        classes.push('layout-static-inactive');
    }

    if (mode === LayoutMode.Overlay && state.isSidebarOpen && !state.isMobile) {
        classes.push('layout-overlay-active');
    }

    if (isPointerRevealMode(mode) && state.isSidebarRevealed) {
        classes.push('layout-sidebar-active');
    }

    if (isPointerRevealMode(mode) && state.isSidebarAnchored) {
        classes.push('layout-sidebar-anchored');
    }

    if (state.isMobile) {
        classes.push('layout-mobile');
    }

    if (state.isMobile && state.isSidebarOpen) {
        classes.push('layout-mobile-active');
    }

    return classes;
}

/**
 * Whether the scrim that dims the content behind a floating sidebar should be showing. Overlay and mobile
 * both cover the page, and both need the click-anywhere-to-close the mask provides; a docked or rail
 * sidebar covers nothing and must not dim anything.
 */
export function isLayoutMaskVisible(state: LayoutConfigState): boolean {
    return effectiveLayoutMode(state) === LayoutMode.Overlay && state.isSidebarOpen;
}
