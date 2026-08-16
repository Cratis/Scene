// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The regions this package's layouts expose.
 *
 * These are the names a {@link Layout}'s {@link Slot}s carry, the keys a page template's content is
 * filed under, and the keys the shell components read out of their `slots` prop - one enum for all three,
 * because a slot filled under a name the shell never reads renders nothing at all and reports nothing
 * either. That silent failure is exactly what a shared vocabulary prevents.
 *
 * The set follows PrimeTek's template line: Sakai establishes topbar/sidebar/menu/content/footer, and the
 * premium templates (Diamond, Atlantis, Freya, Apollo, Ultima, Avalon, Verona) add breadcrumb and a right
 * panel. Both are exposed here, because a layout package that only covers the free template's regions
 * forces anyone wanting the others to fork it.
 */
export enum SlotName {
    /** The fixed strip across the top: brand, the sidebar toggle, and per-screen actions. */
    Topbar = 'topbar',

    /** The sidebar's own chrome - its header, brand and pin button. */
    Sidebar = 'sidebar',

    /** The navigation itself, so a screen can replace the menu without replacing the sidebar around it. */
    Menu = 'menu',

    /** The trail above the content. */
    Breadcrumb = 'breadcrumb',

    /** The screen itself. The only slot every layout declares. */
    Content = 'content',

    /** The strip below the content. */
    Footer = 'footer',

    /** The optional inspector panel down the right-hand edge. */
    RightPanel = 'rightPanel',

    /** The floating configurator. Present in both shells, because a full-page screen still has to be themeable. */
    ConfigPanel = 'configPanel',

    /** The branding half of a full-page screen's split - the panel a login form sits beside. */
    Aside = 'aside',
}
