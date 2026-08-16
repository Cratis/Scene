// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tree, type TreeNodeRow } from 'primereact/tree';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty } from '../properties';
import { treeNodesProperty } from '../treeNodes';
import { toPrimeTreeNodes } from './primeTreeNodes';

/**
 * The `PrimeReact:tree` component - a hierarchy the user can expand and collapse.
 *
 * PrimeReact 11 renders the tree through a flat iterator: `Tree.Nodes` calls its child once per *visible*
 * node, already flattened, and the indentation comes from a level custom property rather than from
 * nesting. That is why this looks like a list even though it draws a tree - the recursion happens in the
 * root, which resolves each node by key, and the adapter only has to say what one row looks like.
 *
 * The two toggle indicators are matched on state rather than swapped in code so that the collapsed and
 * expanded glyphs are both declared up front; `Tree.Toggle` renders a spacer instead of a button for a
 * leaf, which keeps every row's label on the same left edge.
 */
export function PrimeTree({ element }: RegisteredComponentProps) {
    return (
        <Tree.Root
            data-scene-id={element.id}
            value={toPrimeTreeNodes(treeNodesProperty(element, 'nodes'))}
            selectionMode={booleanProperty(element, 'selectable', false) ? 'single' : undefined}>
            {booleanProperty(element, 'filter', false) && <Tree.Filter as='input' placeholder='Search' />}
            <Tree.Nodes>
                {(row: TreeNodeRow) => (
                    <Tree.Node uKey={row.node.key}>
                        <Tree.Content>
                            <Tree.Toggle>
                                <Tree.ToggleIndicator match='collapsed'>▸</Tree.ToggleIndicator>
                                <Tree.ToggleIndicator match='expanded'>▾</Tree.ToggleIndicator>
                            </Tree.Toggle>
                            <Tree.Label>{row.node.label}</Tree.Label>
                        </Tree.Content>
                    </Tree.Node>
                )}
            </Tree.Nodes>
        </Tree.Root>
    );
}
