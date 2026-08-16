// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TreeNode } from './TreeNode';
import { SceneElement } from '@cratis/scene.model';
import { arrayProperty } from './properties';

/**
 * Turns raw authored entries into the `TreeNode` model PrimeReact's tree, tree table, tree select and
 * organization chart all share.
 *
 * A `key` is synthesized from the node's path when an author did not supply one. That is not cosmetic:
 * PrimeReact keys expansion, selection and virtual scrolling off `key`, so a tree of unkeyed nodes
 * expands the wrong rows the moment two siblings share a label. Deriving the key from the path makes it
 * unique and stable across re-renders without asking the author for anything.
 *
 * @param entries The raw entries to convert.
 * @param parentKey The key of the node these entries belong to, used to build stable child keys.
 * @returns The converted nodes, in order.
 */
export function toTreeNodes(entries: unknown[], parentKey = ''): TreeNode[] {
    const nodes: TreeNode[] = [];
    entries.forEach((entry, index) => {
        const path = parentKey === '' ? `${index}` : `${parentKey}-${index}`;
        if (typeof entry === 'string') {
            nodes.push({ key: path, label: entry });
            return;
        }

        if (typeof entry !== 'object' || entry === undefined || entry === null || Array.isArray(entry)) return;

        const record = entry as Record<string, unknown>;
        const node: TreeNode = { key: typeof record.key === 'string' ? record.key : path };
        if (typeof record.label === 'string') node.label = record.label;
        if (typeof record.icon === 'string') node.icon = record.icon;
        if (typeof record.className === 'string') node.className = record.className;
        if (typeof record.leaf === 'boolean') node.leaf = record.leaf;
        if (typeof record.data === 'object' && record.data !== null) node.data = record.data;
        if (Array.isArray(record.children)) node.children = toTreeNodes(record.children, node.key as string);
        nodes.push(node);
    });

    return nodes;
}

/**
 * Reads a tree model off a Scene element's properties.
 *
 * @param element The element whose properties to read.
 * @param name The property name holding the entries.
 * @returns The converted nodes, empty when the property is missing or is not an array.
 */
export function treeNodesProperty(element: SceneElement, name: string): TreeNode[] {
    return toTreeNodes(arrayProperty(element, name));
}
