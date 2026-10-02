// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContributedItem } from '../exposure';
import { SceneEditKind } from './SceneEditKind';

/**
 * Adds an item to an exposed collection from a template instance.
 */
export interface AddCollectionItemEdit {
    kind: SceneEditKind.AddCollectionItem;
    instance?: string;
    component: string;
    path: string;
    item: ContributedItem;

    /** Where among the instance's own items. Absent appends. */
    index?: number;
}

export const AddCollectionItemEditPropertyNames: (keyof AddCollectionItemEdit)[] = ['kind', 'instance', 'component', 'path', 'item', 'index'];
