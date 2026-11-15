// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How the product speaks. Words travel with the design system, so every theme speaks the same way.
 */
export interface DesignWords {
    /** The tone of its text, as key and text pairs. */
    voice?: Record<string, string>;

    /** The terms the product uses instead of the model's own names (showing "Client" where the model says `customer`). */
    naming?: Record<string, string>;
}

export const DesignWordsPropertyNames: (keyof DesignWords)[] = ['voice', 'naming'];
