// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowNode } from './FlowNode';

/**
 * A {@link FlowNode} that arranges child nodes ({@link FlowRow}, {@link FlowColumn} or {@link FlowGrid}).
 */
export interface FlowContainer extends FlowNode {
    gap: number;
    children: FlowNode[];
}

export const FlowContainerPropertyNames: (keyof FlowContainer)[] = ['gap', 'children'];
