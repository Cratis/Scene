// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutArrangement } from '../../Layouts/LayoutArrangement';
import { Ownership } from '../Ownership';
import type { StructureTreeAdapter } from '../StructureTreeAdapter';

export interface TestNode {
    id: string;
    name: string;
    container: boolean;
    ownership: Ownership;
    arrangement?: LayoutArrangement;
    children: TestNode[];
}

export const leaf = (id: string, ownership = Ownership.Local): TestNode =>
    ({ id, name: id, container: false, ownership, children: [] });

export const container = (id: string, children: TestNode[] = [], ownership = Ownership.Local, arrangement?: LayoutArrangement): TestNode =>
    ({ id, name: id, container: true, ownership, arrangement, children });

export const testAdapter: StructureTreeAdapter<TestNode> = {
    idOf: node => node.id,
    nameOf: node => node.name,
    childrenOf: node => node.children,
    withChildren: (node, children) => ({ ...node, children }),
    acceptsChildren: node => node.container,
    ownershipOf: node => node.ownership,
    arrangementOf: node => node.arrangement,
};

/** Renders the tree as nested ids so a spec can compare the whole shape at once, for example `a(b,c(d))`. */
export const shapeOf = (nodes: TestNode[]): string =>
    nodes.map(node => node.children.length > 0 ? `${node.id}(${shapeOf(node.children)})` : node.id).join(',');
