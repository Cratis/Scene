// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Changes one field of an item an instance contributed.
 */
export interface EditCollectionItemEdit {
    kind: SceneEditKind.EditCollectionItem;
    instance?: string;
    component: string;
    path: string;
    itemId: string;

    /** The item field, as the collection's item descriptor states it. */
    field: string;
    value: unknown;
}

export const EditCollectionItemEditPropertyNames: (keyof EditCollectionItemEdit)[] = [
    'kind', 'instance', 'component', 'path', 'itemId', 'field', 'value',
];
