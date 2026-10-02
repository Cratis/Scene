// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowNode } from '../layouts';
import { SceneElement } from '../elements';
import { SceneEditKind } from './SceneEditKind';

/**
 * Inserts a new element - or, into a flow container, a new flow node - under a target.
 *
 * The target is a slot node, an element (an `ExternalComponent` with `slot`, or a panel) or a flow container.
 * Exactly one of `element` and `flowNode` is given.
 */
export interface InsertNodeEdit {
    kind: SceneEditKind.InsertNode;

    /** The id of the node to insert under. */
    target: string;

    /** The named slot of an `ExternalComponent` target to insert into. */
    slot?: string;

    /** Where among the target's children. Absent appends. */
    index?: number;

    element?: SceneElement;
    flowNode?: FlowNode;
}

export const InsertNodeEditPropertyNames: (keyof InsertNodeEdit)[] = ['kind', 'target', 'slot', 'index', 'element', 'flowNode'];
