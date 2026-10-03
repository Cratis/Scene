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
 * An authored key may be a string or a number (a numeric id is a natural key); it is kept as a string. Keys
 * are unique across the whole tree: a node whose authored key was already taken by an earlier node falls back
 * to its path key, so two nodes can never share expansion or selection.
 *
 * An entry that is a string, number or boolean is a leaf labeled with it. Anything else that is not a record
 * (`null`, a nested array) cannot be a node and is skipped; see {@link countUnreadableEntries}.
 *
 * @param entries The raw entries to convert.
 * @param parentKey The key of the node these entries belong to, used to build stable child keys.
 * @param usedKeys The keys already given out in this tree, shared down the recursion.
 * @returns The converted nodes, in order.
 */
export function toTreeNodes(entries: unknown[], parentKey = '', usedKeys: Set<string> = new Set()): TreeNode[] {
    const nodes: TreeNode[] = [];
    entries.forEach((entry, index) => {
        const path = parentKey === '' ? `${index}` : `${parentKey}-${index}`;
        if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
            nodes.push({ key: uniqueKey(undefined, path, usedKeys), label: String(entry) });
            return;
        }

        if (typeof entry !== 'object' || entry === undefined || entry === null || Array.isArray(entry)) return;

        const record = entry as Record<string, unknown>;
        const node: TreeNode = { key: uniqueKey(authoredKey(record.key), path, usedKeys) };
        if (typeof record.label === 'string') node.label = record.label;
        if (typeof record.icon === 'string') node.icon = record.icon;
        if (typeof record.className === 'string') node.className = record.className;
        if (typeof record.leaf === 'boolean') node.leaf = record.leaf;
        if (typeof record.expanded === 'boolean') node.expanded = record.expanded;
        if (typeof record.selectable === 'boolean') node.selectable = record.selectable;
        if (record.data !== undefined && record.data !== null) node.data = record.data;
        if (Array.isArray(record.children)) node.children = toTreeNodes(record.children, node.key as string, usedKeys);
        nodes.push(node);
    });

    return nodes;
}

/**
 * Counts the entries `toTreeNodes` skips, so a control can say that some of its data was not shown instead
 * of silently showing less.
 *
 * @param entries The raw entries.
 * @returns How many entries, at any depth, were neither a scalar nor a record.
 */
export function countUnreadableEntries(entries: unknown[]): number {
    return entries.reduce<number>((count, entry) => {
        if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') return count;
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return count + 1;
        const children = (entry as { children?: unknown }).children;
        return count + (Array.isArray(children) ? countUnreadableEntries(children) : 0);
    }, 0);
}

function authoredKey(value: unknown): string | undefined {
    if (typeof value === 'string' && value !== '') return value;
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : undefined;
}

function uniqueKey(authored: string | undefined, path: string, usedKeys: Set<string>): string {
    let key = authored !== undefined && !usedKeys.has(authored) ? authored : path;
    while (usedKeys.has(key)) key = `${key}~`;
    usedKeys.add(key);
    return key;
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
