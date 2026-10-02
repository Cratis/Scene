// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One collection item a template instance contributes. It is identified by `id`, never by its position, so
 * reordering, removing and editing it stay correct as the collection changes around it.
 */
export interface ContributedItem {
    id: string;

    /** The item's field values, keyed by field path. */
    values: Record<string, unknown>;
}

export const ContributedItemPropertyNames: (keyof ContributedItem)[] = ['id', 'values'];
