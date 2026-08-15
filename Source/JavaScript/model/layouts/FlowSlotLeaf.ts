// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowNode } from './FlowNode';

/**
 * A {@link FlowNode} leaf that positions one of a {@link Layout}'s own named {@link Slot}s within its
 * macro `arrangement` tree - the counterpart to {@link FlowLeaf}, which positions an element within a
 * single slot's own content instead of positioning a slot within the layout.
 */
export interface FlowSlotLeaf extends FlowNode {
    slotName: string;
}

export const FlowSlotLeafPropertyNames: (keyof FlowSlotLeaf)[] = ['slotName'];
