// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Arrangement } from './Arrangement';
import { FreeformVariant } from './FreeformVariant';

/**
 * Arranges a slot's content with one placement variant per size class — the Xcode-storyboard model.
 * The same data/action/form contract is shared across every variant; only placement differs.
 */
export interface FreeformArrangement extends Arrangement {
    variants: FreeformVariant[];
}

export const FreeformArrangementPropertyNames: (keyof FreeformArrangement)[] = ['variants'];
