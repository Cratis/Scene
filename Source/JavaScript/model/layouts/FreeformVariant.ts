// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SizeClass } from '../sizeClasses';
import { ElementPlacement } from './ElementPlacement';

/**
 * One placement variant of a {@link FreeformArrangement}, targeting a specific size class. A size class
 * with no matching variant is a compiler/engine warning, never a silent fallback.
 */
export interface FreeformVariant {
    sizeClass: SizeClass;
    placements: ElementPlacement[];
}

export const FreeformVariantPropertyNames: (keyof FreeformVariant)[] = ['sizeClass', 'placements'];
