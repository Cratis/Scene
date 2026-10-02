// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One item of an inspected collection.
 */
export interface InspectedCollectionItem {
    id: string;
    values: Record<string, unknown>;

    /** `owner` for the template author's item; otherwise the contributing instance. */
    origin: string;

    /** Whether the editing scope may change or remove this item. */
    editable: boolean;
}

export const InspectedCollectionItemPropertyNames: (keyof InspectedCollectionItem)[] = ['id', 'values', 'origin', 'editable'];
