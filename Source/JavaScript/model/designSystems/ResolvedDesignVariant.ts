// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A variant with its parts, and the parts of each of its states, resolved to values.
 */
export interface ResolvedDesignVariant {
    /** The variant's name. */
    name: string;

    /** The resolved value of each part of the variant. */
    parts: Record<string, string>;

    /** Per state, the resolved value of each part the state overrides merged over the variant's parts. Absent for a variant with no state. */
    states?: Record<string, Record<string, string>>;
}

export const ResolvedDesignVariantPropertyNames: (keyof ResolvedDesignVariant)[] = ['name', 'parts', 'states'];
