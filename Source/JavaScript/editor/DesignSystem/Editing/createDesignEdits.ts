// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    addThemeChange,
    defaultThemeChange,
    partChange,
    removeThemeChange,
    roleChange,
    valueChange,
    wordChange,
    type DesignChange,
} from '../Resolving/designEdits';

/** What a person can change by hand on a draft. Each answers why it could not be done, or nothing when it was. */
export interface DesignEdits {
    /** Sets what the theme shown makes of a token: in the mode shown for a color, in every mode for the rest. */
    setValue: (category: string, name: string, value: string) => Promise<string | undefined>;

    /** Declares a token and gives it a value in every mode. */
    addToken: (category: string, name: string, description: string, value: string) => Promise<string | undefined>;

    /** Sets the token a component part takes in a variant or one of its states. */
    setPart: (component: string, variant: string, state: string, part: string, token: string) => Promise<string | undefined>;

    /** Sets a word of the voice or the naming. */
    setWord: (kind: 'voice' | 'naming', key: string, text: string) => Promise<string | undefined>;

    /** Adds a theme as a copy of another. */
    addTheme: (name: string, copyOf: string) => Promise<string | undefined>;

    /** Removes a theme. */
    removeTheme: (name: string) => Promise<string | undefined>;

    /** Makes a theme the default. */
    makeDefault: (name: string) => Promise<string | undefined>;
}

/**
 * The edits a person makes by hand on the draft, each turned into changes to the design system's Screenplay and saved
 * together - the host makes them in the draft's text under the revision the editor loaded.
 *
 * @param theme The theme shown - the one value edits go to.
 * @param isDefault Whether the theme shown is the default theme.
 * @param mode The mode shown - the one a color edit goes to.
 * @param save Saves changes; answers why they were not, or nothing when they were.
 * @returns The edits.
 */
export const createDesignEdits = (
    theme: string,
    isDefault: boolean,
    mode: string,
    save: (changes: readonly DesignChange[]) => Promise<string | undefined>
): DesignEdits => {
    const apply = (...changes: DesignChange[]) => save(changes);

    return {
        setValue: (category, name, value) =>
            apply(valueChange(theme, isDefault, category, name, category === 'color' ? mode : undefined, value)),
        addToken: (category, name, description, value) =>
            apply(roleChange(category, name, description), valueChange(theme, isDefault, category, name, undefined, value)),
        setPart: (component, variant, state, part, token) => apply(partChange(component, variant, state, part, token)),
        setWord: (kind, key, text) => apply(wordChange(kind, key, text)),
        addTheme: (name, copyOf) => apply(addThemeChange(name, copyOf)),
        removeTheme: name => apply(removeThemeChange(name)),
        makeDefault: name => apply(defaultThemeChange(name)),
    };
};
