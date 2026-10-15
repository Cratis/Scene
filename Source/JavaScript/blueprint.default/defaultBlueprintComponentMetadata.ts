// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory } from '@cratis/scene.model';
import { ComponentMetadata, componentMetadata as m, navigationDesignMode } from '@cratis/scene.react';

/** The category, icon, keywords and picker badge of every component of the package (CMP1), keyed by bare component name. */
export const defaultBlueprintComponentMetadata: Record<string, ComponentMetadata> = {
    appShell: m('Application shell', ComponentCategory.Layout, 'app-window', ['layout', 'frame', 'chrome']),
    fullPageShell: m('Full page shell', ComponentCategory.Layout, 'maximize', ['layout', 'fullscreen', 'frame']),
    topbar: m('Topbar', ComponentCategory.Navigation, 'panel-top', ['header', 'top bar', 'navigation'], 'Tp', navigationDesignMode()),
    sidebar: m('Side bar', ComponentCategory.Navigation, 'panel-left', ['navigation', 'menu', 'side panel'], 'Sb', navigationDesignMode({ sidebar: true })),
    menu: m('Menu', ComponentCategory.Navigation, 'menu', ['navigation', 'list', 'links']),
    menuItem: m('Menu item', ComponentCategory.Navigation, 'minus', ['link', 'entry', 'navigation']),
    breadcrumb: m('Breadcrumbs', ComponentCategory.Navigation, 'chevron-right', ['trail', 'path', 'navigation']),
    footer: m('Footer', ComponentCategory.Layout, 'panel-bottom', ['bottom', 'page footer']),
    rightPanel: m('Right panel', ComponentCategory.Layout, 'panel-right', ['side panel', 'drawer', 'aside']),
    configPanel: m('Config panel', ComponentCategory.Layout, 'settings', ['settings', 'layout options', 'preferences']),
    pageHeader: m('Page header', ComponentCategory.Layout, 'heading', ['title', 'header', 'page title']),
    mask: m('Mask', ComponentCategory.Feedback, 'layers', ['overlay', 'scrim', 'backdrop']),
    logo: m('Logo', ComponentCategory.DataDisplay, 'badge', ['brand', 'identity', 'image']),
    userMenu: m('User menu', ComponentCategory.Actions, 'circle-user', ['account', 'profile', 'sign out']),
    themeSwitcher: m('Theme switcher', ComponentCategory.Actions, 'palette', ['theme', 'dark mode', 'colors']),
    layoutModeSwitcher: m('Layout mode switcher', ComponentCategory.Actions, 'layout-dashboard', ['layout', 'mode', 'navigation style']),
};
