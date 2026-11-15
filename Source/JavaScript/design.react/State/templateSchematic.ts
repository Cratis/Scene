// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate, Slot } from '@cratis/scene.model';

/** A slot of a template drawn as a box, in percent of the template's own frame. */
export interface SlotBox {
    slot: Slot;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface FlowNodeLike {
    grow?: number;
    span?: number;
    kind?: string;
    gap?: number;
    columns?: number;
    rows?: number;
    children?: FlowNodeLike[];
    slotName?: string;
}

interface Frame { x: number; y: number; width: number; height: number }

const weight = (node: FlowNodeLike): number => node.grow !== undefined && node.grow > 0 ? node.grow : 1;

function layFlow(node: FlowNodeLike, frame: Frame, placed: Map<string, Frame>): void {
    if (node.slotName !== undefined) { placed.set(node.slotName, frame); return; }
    const children = node.children ?? [];
    if (children.length === 0) return;
    const kind = (node.kind ?? 'Column').toLowerCase();
    if (kind === 'grid') {
        const columns = Math.max(1, node.columns ?? Math.ceil(Math.sqrt(children.length)));
        const rows = Math.max(1, node.rows ?? Math.ceil(children.length / columns));
        children.forEach((child, index) => {
            const column = index % columns, row = Math.floor(index / columns);
            layFlow(child, { x: frame.x + (frame.width / columns) * column, y: frame.y + (frame.height / rows) * row, width: frame.width / columns, height: frame.height / rows }, placed);
        });
        return;
    }
    const total = children.reduce((sum, child) => sum + weight(child), 0);
    let offset = 0;
    for (const child of children) {
        const share = weight(child) / total;
        if (kind === 'row') layFlow(child, { x: frame.x + frame.width * offset, y: frame.y, width: frame.width * share, height: frame.height }, placed);
        else layFlow(child, { x: frame.x, y: frame.y + frame.height * offset, width: frame.width, height: frame.height * share }, placed);
        offset += share;
    }
}

/**
 * Where a template's slots are, as boxes to draw. A flow arrangement is laid out by its rows, columns and grids; a freeform one by the placements of
 * its first size class, scaled to the frame they span; a template with no arrangement - or a slot the arrangement leaves out - stacks its slots in
 * declaration order, so every slot is always shown and none is hidden by an arrangement that forgot it.
 */
export function templateSchematic(template: Pick<ScreenTemplate, 'slots' | 'arrangement'>): SlotBox[] {
    const slots = template.slots;
    if (slots.length === 0) return [];
    const placed = new Map<string, Frame>();
    const arrangement = template.arrangement as { root?: FlowNodeLike; variants?: { placements?: { slotName: string; x: number; y: number; width: number; height: number }[] }[] } | undefined;

    if (arrangement?.root !== undefined) {
        layFlow(arrangement.root, { x: 0, y: 0, width: 100, height: 100 }, placed);
    } else if (arrangement?.variants !== undefined && arrangement.variants[0]?.placements !== undefined) {
        const placements = arrangement.variants[0].placements;
        const right = Math.max(...placements.map(placement => placement.x + placement.width), 1);
        const bottom = Math.max(...placements.map(placement => placement.y + placement.height), 1);
        for (const placement of placements) {
            placed.set(placement.slotName, { x: (placement.x / right) * 100, y: (placement.y / bottom) * 100, width: (placement.width / right) * 100, height: (placement.height / bottom) * 100 });
        }
    }

    const missing = slots.filter(slot => !placed.has(slot.name));
    const boxes: SlotBox[] = slots.filter(slot => placed.has(slot.name)).map(slot => ({ slot, ...placed.get(slot.name)! }));
    if (missing.length === 0) return boxes;
    if (boxes.length === 0) return missing.map((slot, index) => ({ slot, x: 0, y: (100 / missing.length) * index, width: 100, height: 100 / missing.length }));
    // What the arrangement left out goes in a strip under what it laid out, so it can be seen and fixed.
    const strip = 18;
    const scale = (100 - strip) / 100;
    return [
        ...boxes.map(box => ({ ...box, y: box.y * scale, height: box.height * scale })),
        ...missing.map((slot, index) => ({ slot, x: (100 / missing.length) * index, y: 100 - strip, width: 100 / missing.length, height: strip })),
    ];
}

/** The names of the item outlets a template offers - toolbar, filters, row actions - for the schematic's legend. */
export function outletNamesOfTemplate(template: { outlets?: unknown[] }): string[] {
    return (template.outlets ?? []).flatMap(outlet => {
        const name = (outlet as { name?: unknown }).name;
        return typeof name === 'string' ? [name] : [];
    });
}
