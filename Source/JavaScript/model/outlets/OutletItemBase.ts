// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind } from './OutletItemKind';

/**
 * What every item of an outlet has, whatever its kind.
 */
export interface OutletItemBase {
    /** The kind of item; it decides which outlets take it. */
    kind: OutletItemKind;

    /** The identity of the item within its outlet; `hide`, `before` and `after` name it. */
    id: string;

    /** The id of an item this one goes right before, Screenplay's `before <id>`. */
    before?: string;

    /** The id of an item this one goes right after, Screenplay's `after <id>`. */
    after?: string;
}

/** The own property names of {@link OutletItemBase}, checked against the shared shape manifest as `OutletItem`. */
export const OutletItemPropertyNames: (keyof OutletItemBase)[] = ['kind', 'id', 'before', 'after'];
