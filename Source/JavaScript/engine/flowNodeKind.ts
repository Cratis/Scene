// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowColumn, FlowContainer, FlowContainerKind, FlowGrid, FlowLeaf, FlowNode, FlowRow, FlowSlotLeaf } from '@cratis/scene.model';

/**
 * Type guards distinguishing the concrete nodes a flow arrangement tree is built from.
 *
 * Leaves are told apart the same way `elementKind` tells element kinds apart - by the property each one
 * alone declares. Containers cannot be: a row and a column have exactly the same members, so no structural
 * test can separate them. They carry an explicit {@link FlowContainerKind} instead, which is what makes
 * them a discriminated union rather than three identical shapes, and what lets a renderer decide between
 * a horizontal and a vertical arrangement at all.
 */

export function isFlowContainer(node: FlowNode): node is FlowContainer {
    return 'kind' in node && 'children' in node;
}

export function isFlowRow(node: FlowNode): node is FlowRow {
    return isFlowContainer(node) && node.kind === FlowContainerKind.Row;
}

export function isFlowColumn(node: FlowNode): node is FlowColumn {
    return isFlowContainer(node) && node.kind === FlowContainerKind.Column;
}

export function isFlowGrid(node: FlowNode): node is FlowGrid {
    return isFlowContainer(node) && node.kind === FlowContainerKind.Grid;
}

export function isFlowLeaf(node: FlowNode): node is FlowLeaf {
    return 'content' in node;
}

export function isFlowSlotLeaf(node: FlowNode): node is FlowSlotLeaf {
    return 'slotName' in node;
}
