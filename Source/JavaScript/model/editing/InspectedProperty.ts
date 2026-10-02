// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, PropertyDescriptor } from '../descriptors';
import { EditTarget } from './EditTarget';
import { InspectedCollectionItem } from './InspectedCollectionItem';
import { ValueSource } from './ValueSource';

/**
 * One property of an inspected node: its descriptor, its current and effective values, and whether - and
 * through what - the editing scope can change it.
 */
export interface InspectedProperty {
    descriptor: PropertyDescriptor;

    /** The value stored on the node, or `undefined` when none is. */
    currentValue: unknown;

    /** What the property is worth after defaults and instance contributions. */
    effectiveValue: unknown;

    /** Where `effectiveValue` came from. */
    source: `${ValueSource}`;

    /** Whether the editing scope can change the property at all. */
    editable: boolean;

    /** Where an edit goes. Absent when the property is not editable. */
    editTarget?: `${EditTarget}`;

    /** Why the property is not editable. */
    reason?: string;

    /** For an exposed collection: what the editing scope may do with it. */
    operations?: CollectionOperation[];

    /** For a collection: the items, owner's first. */
    items?: InspectedCollectionItem[];
}

export const InspectedPropertyPropertyNames: (keyof InspectedProperty)[] = [
    'descriptor', 'currentValue', 'effectiveValue', 'source', 'editable', 'editTarget', 'reason', 'operations', 'items',
];
