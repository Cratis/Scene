// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useMemo, useState } from 'react';
import { Popover } from 'primereact/popover';
import { Tree, type TreeNodeData } from 'primereact/tree';
import { TreeNode } from '../TreeNode';

/**
 * What a {@link TreeSelect} needs from its host.
 *
 * Deliberately the small subset of PrimeReact 10's `TreeSelect` that a Scene element can actually author.
 * The component is Cratis-owned (see {@link TreeSelect}), so this is a promise this package has to keep
 * on its own - every prop added here is one more thing to implement, and a hierarchy picker earns its
 * keep long before it grows options.
 */
export interface TreeSelectProps {
    /**
     * The key of the selected node. Controlled, because the only thing worth selecting from a tree is a
     * node's identity and the host is what knows what to do with it.
     */
    value?: string;

    /**
     * The hierarchy to choose from, in Scene's own {@link TreeNode} shape rather than PrimeReact's -
     * `TreeNode` is this package's type since v11 removed `primereact/treenode`, and translating it is
     * this component's job rather than every caller's.
     */
    options: TreeNode[];

    /**
     * What the trigger shows when nothing is selected.
     */
    placeholder?: string;

    /**
     * Whether the trigger refuses to open.
     */
    disabled?: boolean;

    /**
     * Called with the newly selected node's key. Selecting also closes the panel, because a single-select
     * picker has nothing left to ask once it has an answer.
     */
    onChange?: (value: string) => void;
}

/**
 * A dropdown whose choices are a hierarchy - Cratis-owned, because PrimeReact 11 removed `TreeSelect`
 * outright and left neither a replacement component nor a headless hook to build one from.
 *
 * It is assembled from the two v11 pieces that did survive and together cover the behavior: `Popover`
 * provides the trigger, the portal and the outside-click and Escape handling, and `Tree` provides the
 * node list, the expand/collapse state and keyboard navigation. Nothing here re-implements either - the
 * component is the seam between them, plus the translation from Scene's {@link TreeNode} to the
 * `TreeNodeData` the tree wants.
 *
 * What it deliberately does not carry over from v10, so that no caller is misled into expecting it:
 * **checkbox multi-select** - selection is single, `onChange` yields one key, and there is no partial or
 * "n selected" state to reason about; and **filtering** - v10's `filter` prop searched the node labels
 * and rebuilt the visible tree around the matches, which is a real amount of behavior (match, keep
 * ancestors, force-expand, restore on clear) and belongs in the component only once something actually
 * needs it.
 */
export function TreeSelect({ value, options, placeholder, disabled, onChange }: TreeSelectProps) {
    const [open, setOpen] = useState(false);
    const nodes = useMemo(() => toTreeNodeData(options), [options]);
    const label = findLabel(nodes, value);

    return (
        <Popover.Root open={open} onOpenChange={(event) => setOpen(event.value === true)}>
            <Popover.Trigger disabled={disabled}>
                <span>{label ?? placeholder}</span>
                <i className='pi pi-chevron-down' />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner>
                    <Popover.Popup>
                        <Popover.Content>
                            <Tree.Root
                                value={nodes}
                                selectionMode='single'
                                selectionKeys={value === undefined ? {} : { [value]: true }}
                                onSelectionChange={(event) => {
                                    const selected = Object.keys(event.value).find((key) => event.value[key] === true);
                                    if (selected === undefined) return;
                                    onChange?.(selected);
                                    setOpen(false);
                                }}>
                                <Tree.Nodes>
                                    {(row) => (
                                        <Tree.Node uKey={row.node.key}>
                                            <Tree.Content>
                                                <Tree.Toggle>
                                                    <Tree.ToggleIndicator>
                                                        <i className={row.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'} />
                                                    </Tree.ToggleIndicator>
                                                </Tree.Toggle>
                                                <Tree.Label>{row.node.label}</Tree.Label>
                                            </Tree.Content>
                                        </Tree.Node>
                                    )}
                                </Tree.Nodes>
                            </Tree.Root>
                        </Popover.Content>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

/**
 * Converts Scene's {@link TreeNode} model into the one PrimeReact 11's `Tree` reads.
 *
 * The two shapes agree on everything that matters except one thing: `key` is optional on a Scene node and
 * required on a PrimeReact one, because the tree keys expansion and selection off it. A missing key is
 * synthesized from the node's position, which is unique and stable across re-renders - the same rule
 * `toTreeNodes` applies, repeated here so this component is correct even when handed nodes that did not
 * come through it.
 *
 * @param nodes The Scene nodes to convert.
 * @param parentKey The key of the node these belong to, used to build unique child keys.
 * @returns The converted nodes, in order.
 */
function toTreeNodeData(nodes: TreeNode[], parentKey = ''): TreeNodeData[] {
    return nodes.map((node, index) => {
        const key = node.key ?? (parentKey === '' ? `${index}` : `${parentKey}-${index}`);
        return {
            key,
            label: node.label,
            icon: node.icon,
            children: node.children === undefined ? undefined : toTreeNodeData(node.children, key),
        };
    });
}

/**
 * Finds the label to show on the trigger for a selected key.
 *
 * The selection is a key rather than a node because that is all the tree reports, so the label has to be
 * looked back up - and it has to search the whole hierarchy, since the selected node is very rarely a
 * root one.
 *
 * @param nodes The converted nodes to search.
 * @param key The selected key, or `undefined` when nothing is selected.
 * @returns The node's label, or `undefined` when nothing is selected or the key matches no node.
 */
function findLabel(nodes: TreeNodeData[], key: string | undefined): ReactNode {
    if (key === undefined) return undefined;
    for (const node of nodes) {
        if (node.key === key) return node.label;
        const found = node.children === undefined ? undefined : findLabel(node.children, key);
        if (found !== undefined) return found;
    }

    return undefined;
}
