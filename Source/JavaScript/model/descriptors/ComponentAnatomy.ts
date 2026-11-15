// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The look a component can take from a design system: the parts it draws, the variants it comes in and the states it reacts to.
 *
 * A component reads its look from anatomy - "my `primary` variant's `background` in `hover`" - and never from a token name, so
 * any design system that declares the same component can restyle it. The engine checks a design system against this declaration
 * and reports every part, variant or state the component cannot render; nothing is dropped silently.
 */
export interface ComponentAnatomy {
    /** The parts the component draws: `text`, `background`, `border`, `radius`, `height`, `padding`, `shadow` or `font`. */
    parts: string[];

    /** The variants the component renders (`primary`, `secondary`, ...). Empty for a component with a single look. */
    variants: string[];

    /** The states the component reacts to: `hover`, `focus`, `active`, `disabled` or `selected`. */
    states: string[];

    /**
     * The property that chooses the variant: `variant` or `emphasis`. Absent means the well-known one - `variant`, else
     * `emphasis`, whichever the component declares as a property.
     */
    variantProperty?: string;
}

export const ComponentAnatomyPropertyNames: (keyof ComponentAnatomy)[] = ['parts', 'variants', 'states', 'variantProperty'];
