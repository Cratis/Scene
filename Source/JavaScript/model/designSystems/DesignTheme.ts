// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignThemeMode } from './DesignThemeMode';

/**
 * A theme of a design system: an implementation that gives every token a value, in every mode.
 */
export interface DesignTheme {
    /** The theme's name. */
    name: string;

    /** The theme's values, one entry per mode of the design system. */
    modes: DesignThemeMode[];

    /** Whether this is the theme an application draws when its profile names none. */
    isDefault?: boolean;

    /** A one-line description for a theme picker. */
    description?: string;
}

export const DesignThemePropertyNames: (keyof DesignTheme)[] = ['name', 'modes', 'isDefault', 'description'];
