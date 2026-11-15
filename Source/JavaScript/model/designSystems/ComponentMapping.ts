// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * An explicit link between a design-system component and a Scene component, overriding the name convention. The design system
 * states it with `maps to <Package.Component>` and a variant-to-property mapping.
 */
export interface ComponentMapping {
    /** The package-qualified Scene component the design-system component renders (for example `PrimeReact.button`). Absent links by name. */
    mapsTo?: string;

    /** The property of the Scene component a variant feeds. Absent means the well-known one: `variant`, else `emphasis`. */
    variantProperty?: string;

    /** Per variant name, the value the property takes when it differs from the variant's name. Absent means each variant's name is the value. */
    variantValues?: Record<string, string>;
}

export const ComponentMappingPropertyNames: (keyof ComponentMapping)[] = ['mapsTo', 'variantProperty', 'variantValues'];
