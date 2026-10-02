// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation } from '../descriptors';

/**
 * One property a template author lets consumers configure.
 *
 * Exposure only ever narrows. A component supports a set of properties (its descriptor); a template author
 * exposes some of them; a consumer sets values for what was exposed. A consumer never reaches anything the
 * author did not expose, and a template nested inside another reaches an outer template's property only when it
 * re-exposes it explicitly.
 */
export interface ExposedProperty {
    /** The id of the element that owns the property. */
    component: string;

    /** The property's path, as its descriptor states it. */
    path: string;

    /** A label for consumers, replacing the descriptor's own. */
    label?: string;

    /**
     * For a collection: what consumers may do with it. Absent means none, so exposing a collection without
     * naming operations exposes nothing a consumer can change.
     */
    operations?: CollectionOperation[];

    /**
     * For a collection with the `EditFields` operation: the item fields a consumer may change. Absent means
     * every field of the item descriptor.
     */
    editableFields?: string[];

    /**
     * Set when this entry passes on a property an outer owner exposed: the name of the layout or template that
     * owns the element. The entry then never widens what the owner exposed - its operations and fields are
     * checked against the owner's.
     */
    reExposes?: string;
}

export const ExposedPropertyPropertyNames: (keyof ExposedProperty)[] = [
    'component', 'path', 'label', 'operations', 'editableFields', 'reExposes',
];
