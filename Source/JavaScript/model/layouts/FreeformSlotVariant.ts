// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SizeClass } from '../sizeClasses';
import { SlotPlacement } from './SlotPlacement';

/**
 * One placement variant of a {@link FreeformSlotArrangement}, targeting a specific size class - the
 * counterpart to {@link FreeformVariant}, which places elements within a single slot instead of placing a
 * layout's own slots. A size class with no matching variant is a compiler/engine warning, never a silent
 * fallback, matching {@link FreeformVariant}.
 */
export interface FreeformSlotVariant {
    sizeClass: SizeClass;
    placements: SlotPlacement[];
}

export const FreeformSlotVariantPropertyNames: (keyof FreeformSlotVariant)[] = ['sizeClass', 'placements'];
