// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveCollectionItem } from './EffectiveCollectionItem';
import { ValueSource } from './ValueSource';

/**
 * One property's value after configuration is resolved, with enough to show where it came from and what
 * resetting it would give back.
 */
export interface EffectivePropertyValue {
    path: string;

    /** What the property is worth now. */
    value: unknown;

    source: `${ValueSource}`;

    /** What the property would be worth with every instance contribution removed. */
    inheritedValue: unknown;

    /** The instance that set `value`, when `source` is `instance`. */
    contributedBy?: string;

    /** For a collection: the items, owner's first. */
    items?: EffectiveCollectionItem[];
}

export const EffectivePropertyValuePropertyNames: (keyof EffectivePropertyValue)[] = [
    'path', 'value', 'source', 'inheritedValue', 'contributedBy', 'items',
];
