// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The light/dark axis of the configurator.
 *
 * The shell never paints a color for a scheme itself - it only records which one is chosen, so the host
 * can hand {@link SceneThemeProvider} a matching {@link Theme}. Keeping the choice and the palette apart
 * is what lets a third-party theme participate in the same switch as the two this package ships.
 */
export enum ColorScheme {
    Light = 'light',
    Dark = 'dark',
}

/** Every {@link ColorScheme}, in the order a configurator should offer them. */
export const colorSchemes: ColorScheme[] = [ColorScheme.Light, ColorScheme.Dark];
