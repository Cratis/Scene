// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { arrayProperty, booleanProperty, numberProperty, stringProperty } from '../properties';
import { resolveEnumeration } from '../resolveEnumeration';
import { countUnreadableEntries, toTreeNodes } from '../treeNodes';
import { useResettingState } from '../useResettingState';
import { useStructuralValue } from '../useStructuralValue';
import { ColumnDefinition } from './ColumnDefinition';
import { TreeTableRow } from './TreeTableRow';
import { TreeTableRowView } from './TreeTableRowView';
import { TreeTableSelectionMode } from './TreeTableSelectionMode';
import { columnDefinitions } from './columnDefinitions';
import { SettledSelection, settleSelection, toggleCheckbox } from './checkboxSelection';
import { isSerializedLegacyElement, legacyElementMessage } from './isSerializedLegacyElement';
import { selectionKeysOf } from './selectionKeysOf';
import { expandedKeysOf, visibleRows } from './treeTableRows';
import { useTreeGridNavigation } from './useTreeGridNavigation';

const labelColumn: ColumnDefinition[] = [{ field: 'label', header: 'Label', sortable: false }];

/**
 * The `PrimeReact:treeTable` component, an ARIA tree grid over the canonical Scene node and column properties.
 *
 * `items` is an array of nodes - strings, numbers, or records with `key`, `label`, `data`, `children`,
 * `expanded` and `selectable` - and the columns come from nested `column` elements, a `columns` property or the
 * fields of the first row's `data`, in that order (see `columnDefinitions`). Serialized legacy UI elements in
 * `items` or `columns` are refused with a visible message; see the package documentation for how they map to
 * canonical slots.
 *
 * - Selection follows the authored `selection` (keys, numbers, `{ key }` objects or PrimeReact's key map) and
 *   starts over when it changes; expansion starts from the authored `expanded` flags the same way. An unrelated
 *   property edit leaves what the user did alone.
 * - In checkbox mode a parent checks and unchecks its subtree and shows a partial state when only some of it is
 *   checked.
 * - The rows form a `treegrid` with a roving tab index and the usual arrow-key navigation.
 * - Object cell values are shown readably, never as `[object Object]`.
 */
export function PrimeTreeTable({ element, interactions }: RegisteredComponentProps) {
    const authoredItems = useStructuralValue(arrayProperty(element, 'items'));
    const items = useMemo(() => authoredItems.filter(entry => !isSerializedLegacyElement(entry)), [authoredItems]);
    const nodes = useMemo(() => toTreeNodes(items), [items]);
    const modeResolution = resolveEnumeration('selectionMode', element.properties.selectionMode, TreeTableSelectionMode, TreeTableSelectionMode.None);
    const mode = modeResolution.isValid ? modeResolution.value : TreeTableSelectionMode.None;
    const enabled = element.isEnabled;
    const pageSize = Math.max(Math.floor(numberProperty(element, 'rows', 10)), 1);
    const paginator = booleanProperty(element, 'paginator', false);
    const [expanded, setExpanded] = useResettingState(expandedKeysOf(nodes), () => new Set(expandedKeysOf(nodes)));
    const [requested, setRequested] = useResettingState(element.properties.selection, () => selectionKeysOf(element.properties.selection));
    const [page, setPage] = useState(0);
    const pageCount = Math.max(Math.ceil(nodes.length / pageSize), 1);
    const currentPage = Math.min(page, pageCount - 1);
    const rows = useMemo(() => visibleRows(paginator ? nodes.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : nodes, expanded), [nodes, paginator, currentPage, pageSize, expanded]);
    const settled = useMemo<SettledSelection>(
        () => mode === TreeTableSelectionMode.Checkbox ? settleSelection(nodes, requested) : { checked: requested, states: new Map() },
        [mode, nodes, requested]
    );
    const columns = useMemo(() => {
        const first = rows.find(row => typeof row.node.data === 'object' && row.node.data !== null && !Array.isArray(row.node.data))?.node.data as Record<string, unknown> | undefined;
        const defined = columnDefinitions(element, first === undefined ? [] : [first]);
        return defined.length > 0 ? defined : labelColumn;
    }, [element, rows]);

    useEffect(() => setPage(current => Math.min(current, pageCount - 1)), [pageCount]);

    const toggle = (key: string) => {
        if (enabled) setExpanded(current => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const select = (row: TreeTableRow) => {
        if (mode === TreeTableSelectionMode.None || !enabled || row.node.selectable === false) return;
        if (mode === TreeTableSelectionMode.Checkbox) {
            setRequested(toggleCheckbox(nodes, settled, row.node));
        } else if (mode === TreeTableSelectionMode.Single) {
            setRequested(new Set([row.key]));
        } else {
            const next = new Set(settled.checked);
            if (next.has(row.key)) next.delete(row.key); else next.add(row.key);
            setRequested(next);
        }

        interactions?.onSelect?.();
        interactions?.onChange?.();
    };

    const navigation = useTreeGridNavigation({ rows, expanded, enabled, toggle, select });
    const changePage = (target: number) => { if (enabled && target >= 0 && target < pageCount) setPage(target); };
    const refusals = [
        modeResolution.isValid ? undefined : modeResolution.message,
        legacyElementMessage(authoredItems, 'items', 'columns'),
        legacyElementMessage(arrayProperty(element, 'columns'), 'columns', 'columns'),
    ].filter((message): message is string => message !== undefined);
    const skipped = countUnreadableEntries(items);

    return (
        <div data-scene-id={element.id} data-scene-component='treeTable' aria-disabled={!enabled} onClick={interactions?.onClick} onDoubleClick={interactions?.onDoubleClick}>
            <table
                role='treegrid'
                aria-label={stringProperty(element, 'ariaLabel', 'Hierarchical data')}
                aria-multiselectable={mode === TreeTableSelectionMode.Multiple || mode === TreeTableSelectionMode.Checkbox ? true : undefined}>
                <thead>
                    <tr role='row'>{columns.map((column, index) => <th key={index} role='columnheader'>{column.header}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <TreeTableRowView
                            key={row.key}
                            row={row}
                            columns={columns}
                            mode={mode}
                            enabled={enabled}
                            expanded={expanded.has(row.key)}
                            selected={settled.checked.has(row.key)}
                            checkState={settled.states.get(row.key)}
                            tabStop={navigation.tabStopKey === row.key}
                            register={navigation.register}
                            onActivate={() => navigation.activate(row.key)}
                            onToggle={() => toggle(row.key)}
                            onSelect={() => select(row)}
                            onKeyDown={event => navigation.onKeyDown(row, event)}
                        />
                    ))}
                    {rows.length === 0 && (
                        <tr role='row'><td role='gridcell' colSpan={columns.length}>{stringProperty(element, 'emptyLabel', 'No records found')}</td></tr>
                    )}
                </tbody>
            </table>
            {paginator && (
                <nav aria-label='Tree table pages'>
                    <button type='button' aria-disabled={!enabled || currentPage === 0} onClick={() => changePage(currentPage - 1)}>Previous</button>
                    <span>{currentPage + 1} / {pageCount}</span>
                    <button type='button' aria-disabled={!enabled || currentPage + 1 >= pageCount} onClick={() => changePage(currentPage + 1)}>Next</button>
                </nav>
            )}
            {refusals.map(message => <p key={message} role='alert' data-scene-state='refused'>{message}</p>)}
            {skipped > 0 && <p role='status'>{`${skipped} entr${skipped === 1 ? 'y' : 'ies'} of items could not be read as a node and ${skipped === 1 ? 'was' : 'were'} skipped.`}</p>}
        </div>
    );
}
