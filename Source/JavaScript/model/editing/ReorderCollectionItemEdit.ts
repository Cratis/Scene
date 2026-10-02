// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Moves an item an instance contributed to another place among that instance's own items.
 */
export interface ReorderCollectionItemEdit {
    kind: SceneEditKind.ReorderCollectionItem;
    instance?: string;
    component: string;
    path: string;
    itemId: string;
    index: number;
}

export const ReorderCollectionItemEditPropertyNames: (keyof ReorderCollectionItemEdit)[] = [
    'kind', 'instance', 'component', 'path', 'itemId', 'index',
];
