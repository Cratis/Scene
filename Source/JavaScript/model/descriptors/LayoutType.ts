// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Every layout type the model can express, as an editor addresses it. A flow container's kind and a panel's
 * concrete type are both layout types, so "change this row to a column" and "change this stack to a wrap panel"
 * are the same operation.
 */
export enum LayoutType {
    FlowRow = 'flowRow',
    FlowColumn = 'flowColumn',
    FlowGrid = 'flowGrid',

    /** A flow leaf: positions one element within a flow tree. */
    FlowLeaf = 'flowLeaf',

    /** A flow leaf that positions one of a layout's own slots. */
    FlowSlotLeaf = 'flowSlotLeaf',

    /** A freeform arrangement: one placement variant per size class. */
    Freeform = 'freeform',

    StackPanel = 'stackPanel',
    WrapPanel = 'wrapPanel',
    DockPanel = 'dockPanel',
    GridPanel = 'gridPanel',
    Canvas = 'canvas',
}
