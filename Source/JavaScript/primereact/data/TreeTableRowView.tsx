// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColumnDefinition } from './ColumnDefinition';
import { TreeTableCheckState } from './TreeTableCheckState';
import { TreeTableRow } from './TreeTableRow';
import { TreeTableSelectionMode } from './TreeTableSelectionMode';
import { nodeLabel } from './treeTableRows';
import { readableValue } from './readableValue';

export interface TreeTableRowViewProps {
    row: TreeTableRow;
    columns: ColumnDefinition[];
    mode: TreeTableSelectionMode;
    enabled: boolean;
    expanded: boolean;
    selected: boolean;
    checkState: TreeTableCheckState | undefined;
    tabStop: boolean;
    register(key: string, element: HTMLElement | null): void;
    onActivate(): void;
    onToggle(): void;
    onSelect(): void;
    onKeyDown(event: React.KeyboardEvent<HTMLElement>): void;
}

/** One `row` of the tree grid: its cells, its expand button and, in checkbox mode, its tri-state checkbox. */
export function TreeTableRowView({ row, columns, mode, enabled, expanded, selected, checkState, tabStop, register, onActivate, onToggle, onSelect, onKeyDown }: TreeTableRowViewProps) {
    const { node } = row;
    const label = nodeLabel(node);
    const hasChildren = (node.children?.length ?? 0) > 0;
    const selectionOffered = mode !== TreeTableSelectionMode.None;
    const rowSelectable = selectionOffered && node.selectable !== false;

    return (
        <tr
            ref={element => register(row.key, element)}
            role='row'
            tabIndex={tabStop ? 0 : -1}
            aria-level={row.depth + 1}
            aria-posinset={row.position}
            aria-setsize={row.siblings}
            aria-expanded={hasChildren ? expanded : undefined}
            aria-selected={selectionOffered ? selected : undefined}
            className={node.className}
            onFocus={onActivate}
            onKeyDown={onKeyDown}
            onClick={event => {
                onActivate();
                if (mode === TreeTableSelectionMode.Single || mode === TreeTableSelectionMode.Multiple) {
                    if (!(event.target as HTMLElement).closest('button, input')) onSelect();
                }
            }}>
            {columns.map((column, index) => (
                <td key={index} role='gridcell' style={index === 0 ? { paddingInlineStart: `${row.depth * 1.25}rem` } : undefined}>
                    {index === 0 && hasChildren && (
                        <button type='button' tabIndex={-1} disabled={!enabled} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`} onClick={onToggle}>
                            {expanded ? 'Collapse' : 'Expand'}
                        </button>
                    )}
                    {index === 0 && mode === TreeTableSelectionMode.Checkbox && checkState !== undefined && (
                        <input
                            type='checkbox'
                            tabIndex={-1}
                            ref={input => { if (input !== null) input.indeterminate = checkState === TreeTableCheckState.Partial; }}
                            checked={checkState === TreeTableCheckState.Checked}
                            disabled={!enabled || !rowSelectable}
                            aria-label={`Select ${label}`}
                            aria-checked={checkState === TreeTableCheckState.Partial ? 'mixed' : checkState === TreeTableCheckState.Checked}
                            onChange={onSelect}
                        />
                    )}
                    {cellText(row, column.field, index === 0)}
                </td>
            ))}
        </tr>
    );
}

function cellText(row: TreeTableRow, field: string, firstColumn: boolean): string {
    const { data } = row.node;
    const record = typeof data === 'object' && data !== null && !Array.isArray(data) ? data as Record<string, unknown> : undefined;
    if (record !== undefined && record[field] !== undefined) return readableValue(record[field]);
    if (!firstColumn) return '';
    return row.node.label ?? (record === undefined ? readableValue(data) : '');
}
