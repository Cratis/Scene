// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One item of a collection after the owner's items and every instance's contributed items are put together.
 */
export interface EffectiveCollectionItem {
    id: string;
    values: Record<string, unknown>;

    /** `owner` for an item the template author wrote; otherwise the id of the instance that contributed it. */
    origin: string;

    /** An owner's item. Consumers cannot change or remove it. */
    fixed: boolean;
}

export const EffectiveCollectionItemPropertyNames: (keyof EffectiveCollectionItem)[] = ['id', 'values', 'origin', 'fixed'];
