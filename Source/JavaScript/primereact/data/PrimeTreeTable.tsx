// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { TreeNode } from '../TreeNode';
import { booleanProperty, numberProperty, recordArrayProperty, stringProperty } from '../properties';
import { treeNodesProperty } from '../treeNodes';
import { ColumnDefinition } from './ColumnDefinition';
import { TreeTableSelectionMode } from './TreeTableSelectionMode';

/** The `PrimeReact:treeTable` component, rendered from the canonical Scene tree and column properties. */
export function PrimeTreeTable({ element, interactions }: RegisteredComponentProps) {
    const nodes = treeNodesProperty(element, 'items');
    const columns = columnsOf(element);
    const pageSize = Math.max(numberProperty(element, 'rows', 10), 1);
    const paginator = booleanProperty(element, 'paginator', false);
    const mode = selectionModeOf(element.properties.selectionMode);
    const [expanded, setExpanded] = useState(() => expandedKeys(nodes));
    const [selected, setSelected] = useState(() => selectedKeysOf(element.properties.selection));
    const [page, setPage] = useState(0);
    const rows = visibleRows(nodes, expanded);
    const start = paginator ? page * pageSize : 0;
    const visible = rows.slice(start, paginator ? start + pageSize : undefined);
    const pageCount = Math.max(Math.ceil(rows.length / pageSize), 1);

    useEffect(() => setPage(current => Math.min(current, pageCount - 1)), [pageCount]);

    const toggle = (key: string) => setExpanded(current => toggleKey(current, key));
    const select = (key: string) => {
        if (mode === TreeTableSelectionMode.None || !element.isEnabled) return;
        setSelected(current => selectedKeysFor(mode, current, key));
        interactions?.onSelect?.();
        interactions?.onChange?.();
    };

    return (
        <div data-scene-id={element.id}>
            <table aria-label={stringProperty(element, 'ariaLabel', 'Hierarchical data')}>
                <thead>
                    <tr>{columns.map(column => <th key={column.field}>{column.header}</th>)}</tr>
                </thead>
                <tbody>
                    {visible.map(row => (
                        <tr key={row.node.key} aria-selected={selected.has(row.node.key ?? '')}>
                            {columns.map((column, index) => (
                                <td key={column.field} style={index === 0 ? { paddingInlineStart: `${row.depth * 1.25}rem` } : undefined}>
                                    {index === 0 && row.node.children?.length ? (
                                        <button type='button' aria-expanded={expanded.has(row.node.key ?? '')} onClick={() => toggle(row.node.key ?? '')}>
                                            {expanded.has(row.node.key ?? '') ? 'Collapse' : 'Expand'}
                                        </button>
                                    ) : null}
                                    {index === 0 && mode === TreeTableSelectionMode.Checkbox ? (
                                        <input
                                            type='checkbox'
                                            checked={selected.has(row.node.key ?? '')}
                                            disabled={!element.isEnabled || row.node.selectable === false}
                                            aria-label={`Select ${cellValue(row.node, column.field, true)}`}
                                            onChange={() => select(row.node.key ?? '')}
                                        />
                                    ) : index === 0 && mode !== TreeTableSelectionMode.None ? (
                                        <button
                                            type='button'
                                            disabled={!element.isEnabled || row.node.selectable === false}
                                            aria-pressed={selected.has(row.node.key ?? '')}
                                            onClick={() => select(row.node.key ?? '')}>
                                            {cellValue(row.node, column.field, true)}
                                        </button>
                                    ) : cellValue(row.node, column.field, index === 0)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {paginator && (
                <nav aria-label='Tree table pages'>
                    <button type='button' disabled={page === 0} onClick={() => setPage(current => current - 1)}>Previous</button>
                    <span>{page + 1} / {pageCount}</span>
                    <button type='button' disabled={page + 1 >= pageCount} onClick={() => setPage(current => current + 1)}>Next</button>
                </nav>
            )}
        </div>
    );
}

function columnsOf(element: RegisteredComponentProps['element']): ColumnDefinition[] {
    const declared = [...(element.slots.columns ?? []), ...(element.slots.content ?? [])]
        .map(column => columnOf(column.properties))
        .filter((column): column is ColumnDefinition => column !== undefined);
    if (declared.length > 0) return declared;

    const configured = recordArrayProperty(element, 'columns')
        .map(column => columnOf(column))
        .filter((column): column is ColumnDefinition => column !== undefined);
    if (configured.length > 0) return configured;

    const first = firstNode(nodesOf(element))?.data;
    const inferred = Object.keys(recordOf(first) ?? {}).map(field => ({ field, header: field, sortable: false }));
    return inferred.length > 0 ? inferred : [{ field: 'label', header: 'Label', sortable: false }];
}

function columnOf(column: Record<string, unknown>): ColumnDefinition | undefined {
    const properties = recordOf(column.properties);
    const field = stringOf(column.field) ?? stringOf(properties?.field) ?? stringOf(column.name);
    const header = stringOf(column.header) ?? stringOf(properties?.header) ?? stringOf(column.label) ?? stringOf(properties?.label) ?? field;
    return field === undefined || header === undefined ? undefined : { field, header, sortable: false };
}

function nodesOf(element: RegisteredComponentProps['element']): TreeNode[] {
    return treeNodesProperty(element, 'items');
}

function visibleRows(nodes: TreeNode[], expanded: Set<string>, depth = 0): { node: TreeNode; depth: number }[] {
    return nodes.flatMap(node => [
        { node, depth },
        ...(node.children && expanded.has(node.key ?? '') ? visibleRows(node.children, expanded, depth + 1) : []),
    ]);
}

function firstNode(nodes: TreeNode[]): TreeNode | undefined {
    for (const node of nodes) {
        if (node.data !== undefined) return node;
        const child = firstNode(node.children ?? []);
        if (child !== undefined) return child;
    }
    return undefined;
}

function cellValue(node: TreeNode, field: string, firstColumn: boolean): string {
    const data = recordOf(node.data);
    const value = data?.[field] ?? (firstColumn ? node.label : undefined);
    return value === undefined || value === null ? '' : String(value);
}

function selectionModeOf(value: unknown): TreeTableSelectionMode {
    if (value === 1 || value === TreeTableSelectionMode.Single) return TreeTableSelectionMode.Single;
    if (value === 2 || value === TreeTableSelectionMode.Multiple) return TreeTableSelectionMode.Multiple;
    if (value === 3 || value === TreeTableSelectionMode.Checkbox) return TreeTableSelectionMode.Checkbox;
    return TreeTableSelectionMode.None;
}

function selectedKeysOf(value: unknown): Set<string> {
    if (typeof value === 'string') return new Set([value]);
    if (Array.isArray(value)) return new Set(value.flatMap(selectionKeyOf));
    return new Set(selectionKeyOf(value));
}

function selectionKeyOf(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    const record = recordOf(value);
    return typeof record?.key === 'string' ? [record.key] : [];
}

function selectedKeysFor(mode: TreeTableSelectionMode, current: Set<string>, key: string): Set<string> {
    if (mode === TreeTableSelectionMode.Single) return new Set([key]);
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
}

function expandedKeys(nodes: TreeNode[]): Set<string> {
    return new Set(nodes.flatMap(node => [
        ...(node.expanded === true && node.key !== undefined ? [node.key] : []),
        ...expandedKeys(node.children ?? []),
    ]));
}

function toggleKey(keys: Set<string>, key: string): Set<string> {
    const next = new Set(keys);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
}

function recordOf(value: unknown): Record<string, unknown> | undefined {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function stringOf(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}
