// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A node in a {@link FlowArrangement}'s tree: a container ({@link FlowRow}, {@link FlowColumn},
 * {@link FlowGrid}) or a leaf positioning one of the slot's own content elements ({@link FlowLeaf}).
 */
export interface FlowNode {
    grow?: number;
    span?: number;
}

export const FlowNodePropertyNames: (keyof FlowNode)[] = ['grow', 'span'];
