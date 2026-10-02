// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyDescriptor } from './PropertyDescriptor';

/**
 * Describes the items of a `Collection` property.
 *
 * An item is a record with a stable `id` (assigned by whoever creates it, never an array index) plus the fields
 * `properties` describes. Field paths are relative to the item and are single names.
 */
export interface CollectionItemDescriptor {
    /** What one item is called, for a host's "add ..." affordance. */
    label?: string;

    /** The fields of one item. */
    properties: PropertyDescriptor[];
}

export const CollectionItemDescriptorPropertyNames: (keyof CollectionItemDescriptor)[] = ['label', 'properties'];
