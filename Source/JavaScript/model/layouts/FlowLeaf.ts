// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowNode } from './FlowNode';
import { SceneElement } from '../elements';

/**
 * A {@link FlowNode} leaf that positions one of the slot's own content elements within the flow tree.
 */
export interface FlowLeaf extends FlowNode {
    content: SceneElement;
}

export const FlowLeafPropertyNames: (keyof FlowLeaf)[] = ['content'];
