// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutChildPlacement } from './LayoutChildPlacement';
import { LayoutType } from './LayoutType';

/**
 * What a layout type can do - the row of the capability matrix an editor consults to decide what to offer.
 */
export interface LayoutCapabilities {
    /** Whether children can be inserted into it. */
    acceptsChildren: boolean;

    /** The most children it can hold, when it is limited. */
    maximumChildren?: number;

    /** Whether position comes from order or from per-child placement. */
    childPlacement: LayoutChildPlacement;

    /** Whether children can span several columns or rows. */
    supportsGridSpan: boolean;

    /** Whether it can vary by width and height size class. */
    supportsSizeClassVariants: boolean;

    /** The layout types it can be changed into, some of them lossily. */
    convertibleTo: LayoutType[];
}

export const LayoutCapabilitiesPropertyNames: (keyof LayoutCapabilities)[] = [
    'acceptsChildren', 'maximumChildren', 'childPlacement', 'supportsGridSpan', 'supportsSizeClassVariants', 'convertibleTo',
];
