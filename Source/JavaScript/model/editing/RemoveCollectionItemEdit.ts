// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Removes an item an instance contributed to an exposed collection.
 */
export interface RemoveCollectionItemEdit {
    kind: SceneEditKind.RemoveCollectionItem;
    instance?: string;
    component: string;
    path: string;
    itemId: string;
}

export const RemoveCollectionItemEditPropertyNames: (keyof RemoveCollectionItemEdit)[] = ['kind', 'instance', 'component', 'path', 'itemId'];
