// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One thing a consumer may do to a collection a template author has exposed. Each is granted on its own: allowing
 * a consumer to add an item says nothing about removing or reordering one.
 */
export enum CollectionOperation {
    /** Add an item. */
    Add = 'add',

    /** Remove an item the consumer added. */
    Remove = 'remove',

    /** Change where an item the consumer added sits. */
    Reorder = 'reorder',

    /** Change the field values of an item the consumer added. */
    EditFields = 'edit-fields',
}
