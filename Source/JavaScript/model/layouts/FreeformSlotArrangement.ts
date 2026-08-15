// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';
import { FreeformSlotVariant } from './FreeformSlotVariant';

/**
 * Arranges a {@link Layout}'s own named {@link Slot}s with one placement variant per size class - the
 * Xcode-storyboard model applied to the layout's slots themselves, rather than to the content of one slot
 * (see {@link FreeformArrangement}). The same slot set is shared across every variant; only placement
 * differs.
 */
export interface FreeformSlotArrangement extends Arrangement {
    variants: FreeformSlotVariant[];
}

export const FreeformSlotArrangementPropertyNames: (keyof FreeformSlotArrangement)[] = ['variants'];
