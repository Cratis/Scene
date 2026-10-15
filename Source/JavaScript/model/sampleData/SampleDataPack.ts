// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataSet } from './SampleDataSet';

/**
 * A named dataset used by design-time editing and preview, owned by a blueprint or by the user. A pack is
 * never part of a running application: Stage production builds do not include or resolve it.
 */
export interface SampleDataPack {
    /** The pack's stable identity, which selections and bindings refer to. */
    id: string;

    /** The display name. A blueprint pack's selector label is `<Blueprint> · <title>`. */
    title: string;

    /** The BCP 47 locale tag of the data (`nb-NO`, `en-GB`); generated gap-filling data follows it. */
    locale: string;

    /** The owner: `blueprint:<id>` for a pack a blueprint ships, or `user` for the author's own. */
    owner: string;

    /** The rows per shape. */
    sets: SampleDataSet[];
}

export const SampleDataPackPropertyNames: (keyof SampleDataPack)[] = ['id', 'title', 'locale', 'owner', 'sets'];
