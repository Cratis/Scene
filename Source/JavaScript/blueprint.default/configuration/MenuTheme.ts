// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How the sidebar surface is tinted, independently of the overall {@link ColorScheme}.
 *
 * A dark sidebar against a light page is the single most common brand customization in the PrimeTek
 * template line, which is why menu theme is its own configurator axis rather than something implied by
 * the color scheme. The shell resolves each value from the active theme's tokens, so a menu theme never
 * introduces a color of its own.
 */
export enum MenuTheme {
    /** The sidebar uses the theme's ordinary card surface. */
    Light = 'light',

    /** The sidebar uses an inverted surface, regardless of the page's color scheme. */
    Dark = 'dark',

    /** The sidebar uses the theme's primary color as its surface. */
    Primary = 'primary',
}

/** Every {@link MenuTheme}, in the order a configurator should offer them. */
export const menuThemes: MenuTheme[] = [MenuTheme.Light, MenuTheme.Dark, MenuTheme.Primary];
