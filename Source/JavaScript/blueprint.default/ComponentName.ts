// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The bare names this package declares components under.
 *
 * A page template writes a bare name and `resolveComponentName` decides which active package wins it, so
 * these names are public API: renaming one breaks every template that referenced it, in this package and
 * in anyone else's. Keeping them in one enum means the manifest, the registry and every template
 * reference the same symbol, and the specs can prove all three agree rather than hoping they do.
 */
export enum ComponentName {
    /** The application shell - topbar, sidebar, breadcrumb, content, footer and an optional right panel. */
    AppShell = 'appShell',

    /** The chrome-less shell - content, an optional branding aside, and the configurator. */
    FullPageShell = 'fullPageShell',

    /** The fixed strip across the top of the application shell. */
    Topbar = 'topbar',

    /** The sidebar's own chrome, inside the shell-positioned panel. */
    Sidebar = 'sidebar',

    /** A navigation list. */
    Menu = 'menu',

    /** One entry in a navigation list, optionally with a submenu. */
    MenuItem = 'menuItem',

    /** The trail above the content. */
    Breadcrumb = 'breadcrumb',

    /** The strip below the content. */
    Footer = 'footer',

    /** The inspector panel down the right-hand edge. */
    RightPanel = 'rightPanel',

    /** The floating configurator: color scheme, layout mode, menu theme and theme. */
    ConfigPanel = 'configPanel',

    /** A screen's title, subtitle and actions. */
    PageHeader = 'pageHeader',

    /** The scrim behind a floating sidebar, which also closes it. */
    Mask = 'mask',

    /** The brand mark. */
    Logo = 'logo',

    /** The signed-in user's avatar and menu. */
    UserMenu = 'userMenu',

    /** Switches between the themes a host offers. */
    ThemeSwitcher = 'themeSwitcher',

    /** Switches between the layout modes. */
    LayoutModeSwitcher = 'layoutModeSwitcher',
}
