// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterControl } from './FilterControl';
import { OutletItemBase } from './OutletItemBase';
import { OutletItemKind } from './OutletItemKind';
import { QueryParameterReference } from './QueryParameterReference';

/**
 * A filter of an outlet of filters: Screenplay's `filter <id> title "…" sets <query>.<parameter>`.
 */
export interface OutletFilter extends OutletItemBase {
    /** Always a filter. */
    kind: OutletItemKind.Filter;

    /** The label of the filter. */
    title: string;

    /** The control the filter shows; the parameter's type decides when absent. */
    control?: FilterControl;

    /** The query parameter the filter sets. */
    sets?: QueryParameterReference;
}

/** The own property names of {@link OutletFilter}, checked against the shared shape manifest. */
export const OutletFilterPropertyNames: (keyof OutletFilter)[] = ['kind', 'title', 'control', 'sets'];
