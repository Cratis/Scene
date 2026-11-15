// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A property every theme must satisfy: wherever a component has both parts, the foreground must reach the ratio against the background.
 */
export interface ContrastRule {
    /** The part drawn on the background (`text`). */
    foreground: string;

    /** The part it is drawn on (`background`). */
    background: string;

    /** The least WCAG contrast ratio (for example `4.5`). */
    minimumRatio: number;
}

export const ContrastRulePropertyNames: (keyof ContrastRule)[] = ['foreground', 'background', 'minimumRatio'];
