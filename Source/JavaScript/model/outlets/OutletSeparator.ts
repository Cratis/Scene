// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemBase } from './OutletItemBase';
import { OutletItemKind } from './OutletItemKind';

/**
 * A separator between actions.
 */
export interface OutletSeparator extends OutletItemBase {
    /** Always a separator. */
    kind: OutletItemKind.Separator;
}

/** The own property names of {@link OutletSeparator}, checked against the shared shape manifest. */
export const OutletSeparatorPropertyNames: (keyof OutletSeparator)[] = ['kind'];
