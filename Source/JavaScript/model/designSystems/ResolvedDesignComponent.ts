// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ResolvedDesignVariant } from './ResolvedDesignVariant';

/**
 * A component with its variants resolved to values in one theme and mode.
 */
export interface ResolvedDesignComponent {
    /** The component's name. */
    name: string;

    /** The resolved variants. */
    variants: ResolvedDesignVariant[];
}

export const ResolvedDesignComponentPropertyNames: (keyof ResolvedDesignComponent)[] = ['name', 'variants'];
