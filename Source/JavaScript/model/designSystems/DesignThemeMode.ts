// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ResolvedDesignComponent } from './ResolvedDesignComponent';

/**
 * A theme's values in one mode: every token's value and every component part's value, with references already followed.
 */
export interface DesignThemeMode {
    /** The mode these values are for. */
    mode: string;

    /** The resolved value of each token role, keyed by `<category>.<name>`. */
    tokens: Record<string, string>;

    /** The components resolved to values. Absent when they are to be evaluated from the anatomy and `tokens`. */
    components?: ResolvedDesignComponent[];

    /** What could not be resolved, each as a message naming the token or part. Absent for none. */
    problems?: string[];
}

export const DesignThemeModePropertyNames: (keyof DesignThemeMode)[] = ['mode', 'tokens', 'components', 'problems'];
