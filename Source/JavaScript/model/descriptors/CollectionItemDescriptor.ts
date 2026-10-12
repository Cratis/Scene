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

    /**
     * An item may carry fields `properties` does not describe. They are kept as they are and never edited. Without it a
     * field the descriptor does not describe is refused.
     */
    open?: boolean;

    /**
     * The items are plain records that carry no `id`: they are the authored data of a control - a chart's datasets, a tree's nodes -
     * and are told apart by their position, as they are wherever else that data is written. Without it every item needs a unique
     * `id` of its own. An item that has an `id` keeps it.
     */
    positional?: boolean;
}

export const CollectionItemDescriptorPropertyNames: (keyof CollectionItemDescriptor)[] = ['label', 'properties', 'open', 'positional'];
