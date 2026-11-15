// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A variant of a component, with the token role each of its parts takes and the parts each of its states overrides.
 */
export interface DesignVariant {
    /** The variant's name (for example `primary`). */
    name: string;

    /** The token role (`<category>.<name>`) of each part. The variant's own parts are the `default` state. */
    parts: Record<string, string>;

    /**
     * Per state (`hover`, `focus`, `active`, `disabled`, `selected`), the token role of each part the state overrides; every
     * other part keeps the variant's. Absent for a variant with no state.
     */
    states?: Record<string, Record<string, string>>;
}

export const DesignVariantPropertyNames: (keyof DesignVariant)[] = ['name', 'parts', 'states'];
