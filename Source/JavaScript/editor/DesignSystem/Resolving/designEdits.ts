// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One change to a design system's Screenplay: what lives at an address, or nothing to take it away. The editor never edits
 * the Screenplay itself - it names the change by address and the host's draft command makes it in the draft's text.
 */
export interface DesignChange {
    /** The address of what changes, in the vocabulary the helpers of this module build (`tokens.color.accent`, `components.Button.variants.primary.text`, `words.voice.tone`). */
    path: string;

    /** What it is to hold - empty to remove it. */
    value: string;
}

const themePrefix = (theme: string, isDefault: boolean) => isDefault ? '' : `theme.${theme}.`;

/**
 * Declares or changes a token role - what a token is for.
 * @param category The token category.
 * @param name The token's name.
 * @param description What it is for; empty removes the token everywhere.
 * @returns The change.
 */
export const roleChange = (category: string, name: string, description: string): DesignChange => ({ path: `tokens.${category}.${name}`, value: description });

/**
 * Sets what a theme makes of a token: in one mode for a color, in every mode for the rest.
 * @param theme The theme.
 * @param isDefault Whether it is the default theme.
 * @param category The token category.
 * @param name The token's name.
 * @param mode The mode - undefined for a value that holds in every mode.
 * @param value The value, a palette reference or another token; empty removes it.
 * @returns The change.
 */
export const valueChange = (theme: string, isDefault: boolean, category: string, name: string, mode: string | undefined, value: string): DesignChange =>
    ({ path: `${themePrefix(theme, isDefault)}${mode ?? 'values'}.${category}.${name}`, value });

/**
 * Sets the token a component part uses in a variant, or in one of its states.
 * @param component The component.
 * @param variant The variant.
 * @param state The state; `default` is the variant itself.
 * @param part The part.
 * @param token The token's address; empty removes it.
 * @returns The change.
 */
export const partChange = (component: string, variant: string, state: string, part: string, token: string): DesignChange => ({
    path: state === 'default'
        ? `components.${component}.variants.${variant}.${part}`
        : `components.${component}.variants.${variant}.states.${state}.${part}`,
    value: token,
});

/**
 * Sets a word of the product's voice or naming.
 * @param kind Whether it is voice or naming.
 * @param key The word's key.
 * @param text The text; empty removes it.
 * @returns The change.
 */
export const wordChange = (kind: 'voice' | 'naming', key: string, text: string): DesignChange => ({ path: `words.${kind}.${key}`, value: text });

/**
 * Adds a theme as a copy of another.
 * @param name The new theme's name.
 * @param copyOf The theme to copy.
 * @returns The change.
 */
export const addThemeChange = (name: string, copyOf: string): DesignChange => ({ path: `themes.${name}`, value: copyOf });

/**
 * Removes a theme - not the default one.
 * @param name The theme.
 * @returns The change.
 */
export const removeThemeChange = (name: string): DesignChange => ({ path: `themes.${name}`, value: '' });

/**
 * Makes a theme the default.
 * @param name The theme.
 * @returns The change.
 */
export const defaultThemeChange = (name: string): DesignChange => ({ path: 'default-theme', value: name });
