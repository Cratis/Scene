// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What every `@cratis/components` command form field needs in order to bind itself to one property of
 * the command the surrounding form is editing.
 *
 * The library's fields take an *accessor* (`value={command => command.name}`) rather than a property
 * name, so that a hand-written form is typechecked end to end against the generated command proxy. A
 * screen has no types to check against - it carries the property name as a string - so this is where the
 * name becomes the accessor the field expects.
 */
export interface FieldBinding {
    /**
     * Reads the bound property off the command instance the form hands in. Built from the screen's
     * `property` name, which is the only form the binding can take once it has been through a `.play`
     * file.
     */
    value: (instance: Record<string, unknown>) => unknown;

    /** The label rendered with the field. */
    title: string;

    /** Helper text rendered under the field, when the screen supplies any. */
    description?: string;
}
