// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Sets a property on a node the editing scope owns.
 */
export interface SetPropertyEdit {
    kind: SceneEditKind.SetProperty;
    nodeId: string;

    /** The property path, as its descriptor states it. */
    path: string;
    value: unknown;
}

export const SetPropertyEditPropertyNames: (keyof SetPropertyEdit)[] = ['kind', 'nodeId', 'path', 'value'];
