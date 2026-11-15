// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentMapping } from './ComponentMapping';
import { DesignVariant } from './DesignVariant';

/**
 * A component of a design system: the parts it is made of and the variants it comes in. A Scene component of the same name
 * (or the one `mapping.mapsTo` names) renders from this anatomy.
 */
export interface DesignComponent {
    /** The component's name (for example `Button`). */
    name: string;

    /** The parts the component uses: `text`, `background`, `border`, `radius`, `height`, `padding`, `shadow` and `font`. */
    parts: string[];

    /** The variants, each assigning a token role to its parts. */
    variants: DesignVariant[];

    /** How the component links to a Scene component when the name convention is not enough. Absent links by name. */
    mapping?: ComponentMapping;
}

export const DesignComponentPropertyNames: (keyof DesignComponent)[] = ['name', 'parts', 'variants', 'mapping'];
