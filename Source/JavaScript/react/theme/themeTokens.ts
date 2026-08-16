// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';

/**
 * The prefix every Scene design token gets as a CSS custom property. A package adapts these to whatever
 * its own component library expects — the PrimeReact package maps them onto PrimeReact's variables, the
 * same indirection `@cratis/components` uses for its `--cratis-*` layer — so layout and component CSS
 * never hardcodes one library's variable names.
 */
export const themeTokenPrefix = '--scene';

/**
 * Turns a semantic token name into its CSS custom property name: `primary.color` becomes
 * `--scene-primary-color`, `surface.borderColor` becomes `--scene-surface-border-color`.
 *
 * Token names are semantic and platform-neutral in `Scene.Model` on purpose; this is the one place that
 * decides what they look like in CSS, so a non-DOM renderer can make an entirely different choice.
 */
export function themeTokenProperty(token: string): string {
    const kebab = token
        .split('.')
        .map((part) => part.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase())
        .join('-');
    return `${themeTokenPrefix}-${kebab}`;
}

/**
 * Applies a theme to an element, in place.
 *
 * Every token becomes a custom property on the element, and the element is marked with the theme's name
 * and colour scheme so CSS can key off either. Tokens the previous theme set and this one does not are
 * removed, so switching themes cannot leave a stale value behind.
 *
 * This is deliberately a mutation of an existing element rather than a re-render: switching theme has to
 * be live re-resolution against the running profile, with no reload and no remount, or a gallery preview
 * flickers every time someone tries a different theme.
 */
export function applyThemeTokens(element: HTMLElement, theme: Theme | undefined, previous?: Theme): void {
    for (const token of Object.keys(previous?.tokens ?? {})) {
        if (!theme?.tokens || !(token in theme.tokens)) {
            element.style.removeProperty(themeTokenProperty(token));
        }
    }

    if (!theme) {
        element.removeAttribute('data-scene-theme');
        element.removeAttribute('data-scene-color-scheme');
        return;
    }

    for (const [token, value] of Object.entries(theme.tokens ?? {})) {
        element.style.setProperty(themeTokenProperty(token), value);
    }

    element.setAttribute('data-scene-theme', theme.name);
    element.setAttribute('data-scene-color-scheme', theme.isDark ? 'dark' : 'light');
}
