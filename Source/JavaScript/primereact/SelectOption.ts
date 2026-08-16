// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One choice in a selection component - a dropdown, a multi-select, a list box, a set of radio buttons.
 *
 * Scene elements carry properties as untyped JSON, so an `options` property arrives as anything at all.
 * Normalizing every shape a screen author might reasonably write (a bare string, or a record with a
 * label and a value) into this one type is what keeps every selection adapter from re-deriving the same
 * guesswork - and what lets them all pass `optionLabel="label"` / `optionValue="value"` to PrimeReact
 * without inspecting the data first.
 */
export interface SelectOption {
    /**
     * The text shown to the user.
     */
    label: string;

    /**
     * The value carried when the option is picked. Falls back to the label when a screen only supplied
     * text, so a one-value-per-label list stays valid without the author repeating themselves.
     */
    value: string;
}
