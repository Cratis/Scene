// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyChoice, PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';

/** The ways a shell can present its navigation; the value of the `navigationMode` shell option. */
export enum NavigationMode {
    Static = 'static',
    Overlay = 'overlay',
    Slim = 'slim',
    SlimPlus = 'slimPlus',
    Compact = 'compact',
    Horizontal = 'horizontal',
    Reveal = 'reveal',
    Drawer = 'drawer',
}

/** The surface colour of the menu; the value of the `menuTheme` shell option. */
export enum MenuThemeChoice {
    Light = 'light',
    Dark = 'dark',
    Primary = 'primary',
}

/** How a navigation mode presents the menu on a pointer device. */
export enum MenuPresentation {
    /** A sidebar that is always visible. */
    Sidebar = 'sidebar',

    /** A narrow rail that is always visible. */
    Rail = 'rail',

    /** A menu that is hidden until the hamburger opens it. */
    Hidden = 'hidden',

    /** The items live in the top bar. */
    TopBar = 'topBar',

    /** A rail that expands to the full menu on hover. */
    Reveal = 'reveal',
}

export interface NavigationModeInfo {
    id: NavigationMode;
    label: string;

    /** The one-line description a host shows under the mode. */
    description: string;
    presentation: MenuPresentation;

    /** The width of the visible menu in pixels; absent when nothing is always visible. */
    width?: number;

    /** Whether the menu is drawn over a dimming scrim while it is open. */
    scrim: boolean;

    /** Whether the mode only works with a pointer that can hover. */
    needsHover: boolean;

    /** The legacy `layout-*` mode string this mode was stored as. */
    legacy: string;
}

export const navigationModes: readonly NavigationModeInfo[] = [
    { id: NavigationMode.Static, label: 'Static', description: '240 px sidebar, always visible', presentation: MenuPresentation.Sidebar, width: 240, scrim: false, needsHover: false, legacy: 'static' },
    { id: NavigationMode.Overlay, label: 'Overlay', description: 'Menu hidden; the hamburger slides it over the content with no dimming', presentation: MenuPresentation.Hidden, scrim: false, needsHover: false, legacy: 'overlay' },
    { id: NavigationMode.Slim, label: 'Slim', description: '68 px rail with icons only', presentation: MenuPresentation.Rail, width: 68, scrim: false, needsHover: false, legacy: 'slim' },
    { id: NavigationMode.SlimPlus, label: 'Slim+', description: '92 px rail with an icon and a small label under it', presentation: MenuPresentation.Rail, width: 92, scrim: false, needsHover: false, legacy: 'slim-plus' },
    { id: NavigationMode.Compact, label: 'Compact', description: '190 px sidebar, tighter rows, smaller type', presentation: MenuPresentation.Sidebar, width: 190, scrim: false, needsHover: false, legacy: 'compact' },
    { id: NavigationMode.Horizontal, label: 'Horizontal', description: 'Items in the top bar; the sidebar disappears', presentation: MenuPresentation.TopBar, scrim: false, needsHover: false, legacy: 'horizontal' },
    { id: NavigationMode.Reveal, label: 'Reveal', description: 'Slim rail that expands to the full menu on hover', presentation: MenuPresentation.Reveal, width: 68, scrim: false, needsHover: true, legacy: 'reveal' },
    { id: NavigationMode.Drawer, label: 'Drawer', description: 'Menu hidden; the hamburger opens it with a dimmed scrim; clicking the scrim closes it', presentation: MenuPresentation.Hidden, scrim: true, needsHover: false, legacy: 'drawer' },
];

export interface MenuThemeInfo {
    id: MenuThemeChoice;
    label: string;
    description: string;
}

export const menuThemes: readonly MenuThemeInfo[] = [
    { id: MenuThemeChoice.Light, label: 'Light', description: 'A light menu surface' },
    { id: MenuThemeChoice.Dark, label: 'Dark', description: 'A dark menu surface' },
    { id: MenuThemeChoice.Primary, label: 'Primary', description: 'The menu surface uses the accent colour' },
];

export const defaultNavigationMode = NavigationMode.Static;
export const defaultMenuTheme = MenuThemeChoice.Light;

/**
 * Reads a stored navigation mode, accepting the legacy strings (`slim-plus`) and any letter case, so a stored profile never has to be rewritten.
 *
 * @param value The stored value.
 * @returns The mode, or `undefined` when the value names none.
 */
export function normalizeNavigationMode(value: unknown): NavigationMode | undefined {
    if (typeof value !== 'string') return undefined;
    const key = value.trim().toLowerCase().replace(/[-_\s+]/g, match => (match === '+' ? 'plus' : ''));
    return navigationModes.find(mode => mode.id.toLowerCase() === key)?.id;
}

/** What the menu does in a regime. */
export interface MenuBehavior {
    mode: NavigationMode;
    presentation: MenuPresentation;
    width?: number;
    scrim: boolean;

    /** The mode the menu really behaves as; differs from `mode` when the regime replaces it. */
    effectiveMode: NavigationMode;

    /** Why the effective mode differs, when it does. */
    note?: string;
}

/**
 * Describes what the menu does in a mode. On a touch size class the menu is always a drawer with a scrim, whatever the mode.
 *
 * @param mode The chosen mode.
 * @param touch Whether the target is a touch size class.
 * @returns The behavior a host previews.
 */
export function describeMenuBehavior(mode: NavigationMode, touch: boolean): MenuBehavior {
    const info = navigationModes.find(candidate => candidate.id === mode)!;
    if (!touch) {
        return { mode, presentation: info.presentation, ...(info.width === undefined ? {} : { width: info.width }), scrim: info.scrim, effectiveMode: mode };
    }

    const drawer = navigationModes.find(candidate => candidate.id === NavigationMode.Drawer)!;
    return {
        mode,
        presentation: drawer.presentation,
        scrim: true,
        effectiveMode: NavigationMode.Drawer,
        ...(mode === NavigationMode.Drawer ? {} : { note: info.needsHover ? `${info.label} needs hover, so a touch screen shows a drawer instead` : 'On a touch screen the menu is always a drawer' }),
    };
}

export interface MenuModeChange {
    mode: NavigationMode;
    changed: boolean;

    /** The line a designer puts in its status bar; absent when nothing changed. */
    message?: string;
}

/**
 * Answers the navigation mode after the shell changes: the shell's own default wins, and the author can change it afterwards.
 *
 * @param current The mode in place, if any.
 * @param shellDefault The new shell's declared default mode, if any.
 * @param shellName The new shell's display name, for the message.
 * @returns The mode after the switch.
 */
export function menuModeAfterShellSwitch(current: string | undefined, shellDefault: string | undefined, shellName: string): MenuModeChange {
    const before = normalizeNavigationMode(current) ?? defaultNavigationMode;
    const declared = normalizeNavigationMode(shellDefault);
    if (declared === undefined || declared === before) return { mode: before, changed: false };
    const label = navigationModes.find(candidate => candidate.id === declared)!.label;
    return { mode: declared, changed: true, message: `Menu mode set to ${label} by ${shellName}` };
}

const choicesOf = (items: readonly { id: string; label: string; description: string }[]): PropertyChoice[] =>
    items.map(item => ({ value: item.id, label: item.label, description: item.description }));

/** The typed shell options every root template offers, as property descriptors a host draws pickers from. */
export function shellOptionDescriptors(): PropertyDescriptor[] {
    return [
        {
            path: 'navigationMode', label: 'Menu mode', group: 'Menu', valueType: PropertyValueType.Enum, choices: choicesOf(navigationModes), default: defaultNavigationMode,
            description: 'How the shell presents the application\'s navigation.',
        },
        {
            path: 'menuTheme', label: 'Menu theme', group: 'Menu', valueType: PropertyValueType.Enum, choices: choicesOf(menuThemes), default: defaultMenuTheme,
            description: 'The colour of the menu surface only; the rest of the application keeps its scheme. Primary uses the accent colour.',
        },
    ];
}
