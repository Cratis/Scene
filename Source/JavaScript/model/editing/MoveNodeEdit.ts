// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from './SceneEditKind';

/**
 * Moves a node - reordering it within its parent or reparenting it - checking containment and cycles.
 */
export interface MoveNodeEdit {
    kind: SceneEditKind.MoveNode;
    nodeId: string;

    /** The id of the node to move under. */
    target: string;
    slot?: string;
    index?: number;
}

export const MoveNodeEditPropertyNames: (keyof MoveNodeEdit)[] = ['kind', 'nodeId', 'target', 'slot', 'index'];
