// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The contrast measured for one pair of parts in one theme and mode, against the ratio a {@link ContrastRule} asks for. A finding
 * below its required ratio is a problem to show; one at or above it is the evidence the rule holds.
 */
export interface ContrastFinding {
    /** The theme. */
    theme: string;

    /** The mode. */
    mode: string;

    /** The component. */
    component: string;

    /** The variant. */
    variant: string;

    /** The state. Absent for the variant's own parts. */
    state?: string;

    /** The foreground part. */
    foreground: string;

    /** The background part. */
    background: string;

    /** The measured WCAG contrast ratio. */
    ratio: number;

    /** The ratio the rule asks for. */
    required: number;
}

export const ContrastFindingPropertyNames: (keyof ContrastFinding)[] = [
    'theme', 'mode', 'component', 'variant', 'state', 'foreground', 'background', 'ratio', 'required',
];
