// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemBase } from './OutletItemBase';
import { OutletItemKind } from './OutletItemKind';
import { QueryFieldReference } from './QueryFieldReference';

/**
 * A stat of an outlet of stats: Screenplay's `stat <id> title "…" value from <query>.<field>`.
 */
export interface OutletStat extends OutletItemBase {
    /** Always a stat. */
    kind: OutletItemKind.Stat;

    /** The label of the stat. */
    title: string;

    /** The field of a single-result query the stat shows. */
    valueFrom?: QueryFieldReference;

    /** The field the stat's trend comes from, when it shows one. */
    trend?: QueryFieldReference;
}

/** The own property names of {@link OutletStat}, checked against the shared shape manifest. */
export const OutletStatPropertyNames: (keyof OutletStat)[] = ['kind', 'title', 'valueFrom', 'trend'];
