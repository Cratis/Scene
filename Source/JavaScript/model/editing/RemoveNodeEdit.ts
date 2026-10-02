// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Removes a node and everything under it.
 */
export interface RemoveNodeEdit {
    kind: SceneEditKind.RemoveNode;
    nodeId: string;
}

export const RemoveNodeEditPropertyNames: (keyof RemoveNodeEdit)[] = ['kind', 'nodeId'];
