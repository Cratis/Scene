// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowColumn, FlowContainerKind, FlowGrid, FlowNode, FlowRow, FlowSlotLeaf } from '@cratis/scene.model';

/**
 * Small constructors for the `flow` primitives a layout's macro arrangement is built from.
 *
 * They exist because the primitives are structural interfaces with required members (`gap` and
 * `children` on every container), so writing a tree as object literals buries the shape under
 * boilerplate - and a layout tree is a thing to be read, not decoded. These keep the declarations in
 * `appShell.ts` and `fullPage.ts` down to the structure itself.
 *
 * Each container carries its {@link FlowContainerKind}, which is what lets a renderer tell a row from a
 * column - they are otherwise the same shape, and TypeScript has no runtime types to test. These builders
 * set it, so a declaration site never has to repeat it and can never get it wrong.
 */

/**
 * A leaf positioning one of the containing layout's or screen template's own named slots.
 *
 * Takes a plain string rather than one enum, because a layout arranges {@link SlotName}s while a screen
 * template arranges its own vocabulary - and the same builder has to serve both. That every leaf names a
 * slot its container actually declares is checked by a spec rather than by the type, since no type can
 * express "one of whatever this particular container declared".
 */
export function slotLeaf(slotName: string, node: FlowNode = {}): FlowSlotLeaf {
    return { ...node, slotName };
}

/** A container arranging its children horizontally. */
export function row(children: FlowNode[], gap = 0, node: FlowNode = {}): FlowRow {
    return { ...node, gap, children, kind: FlowContainerKind.Row };
}

/** A container arranging its children vertically. */
export function column(children: FlowNode[], gap = 0, node: FlowNode = {}): FlowColumn {
    return { ...node, gap, children, kind: FlowContainerKind.Column };
}

/**
 * A container arranging its children in a grid.
 *
 * `columns` is always set rather than left to the renderer - a grid that does not say how many tracks it
 * has leaves the renderer guessing at the one thing the author cared about.
 */
export function grid(children: FlowNode[], columns: number, gap = 0, node: FlowNode = {}): FlowGrid {
    return { ...node, gap, children, columns, kind: FlowContainerKind.Grid };
}
