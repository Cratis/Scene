// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { initialsOf } from './avatarModel';
import { FoundationFrame } from './StateFrame';
import { formatDate, formatNumber, NumberFormat, readLocale } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import {
    CellKind, ListColumn, ListRow, ListVariant, filterRows, formatSort, groupRows, nextSort, paginate, parseSelection, parseSort, readListColumns, readListVariant, rowId,
    searchRows, sortRows, textOf, toggleSelection,
} from './listModel';
import { useCompactWidth } from './useCompactWidth';
import { useUrlState } from './urlState';

function Cell({ column, row, locale }: { column: ListColumn; row: ListRow; locale: string }) {
    const raw = row[column.field];
    const text = textOf(row, column.field);
    switch (column.kind) {
        case CellKind.Number: return <>{typeof raw === 'number' ? formatNumber(raw, locale) : text}</>;
        case CellKind.Currency: return <>{typeof raw === 'number' ? formatNumber(raw, locale, NumberFormat.Currency, column.currency ?? 'USD') : text}</>;
        case CellKind.Date: return <>{formatDate(raw, locale)}</>;
        case CellKind.Status: {
            const tone = column.tones[text] ?? 'neutral';
            const icon = ({ success: 'check', warning: 'alert', danger: 'close', info: 'info', neutral: 'circle' } as const)[tone as 'success'] ?? 'circle';
            return <span className='foundation-chip' data-tone={tone}><FoundationIcon name={icon} /><span>{text}</span></span>;
        }
        case CellKind.Progress: {
            const percent = typeof raw === 'number' ? Math.min(100, Math.max(0, raw)) : Math.min(100, Math.max(0, Number(text) || 0));
            return <span className='foundation-progress'><progress value={percent} max={100} aria-label={column.header}>{percent}%</progress><span>{formatNumber(percent / 100, locale, NumberFormat.Percent)}</span></span>;
        }
        default: return <>{text}</>;
    }
}

/**
 * The `dataList` component: the records of a collection as a table, as cards, or grouped with subtotals, with search, sort, paging and
 * selection that live in the address.
 *
 * `rows` and `columns` (`field`, `header`, `kind`: text, number, currency, date or status, `sortable`, `tones`) come from a query; the list takes its
 * text, filter, sort, page and selection from the address when `urlKey` is given (`<urlKey>q`, `sort`, `page`, `selected`), so a shared link or a refresh restores
 * the screen as it was. `search` and `filter` (the filter builder's value) narrow the rows. A header is a button that cycles ascending, descending, none, and the
 * column says so in words. Rows select with checkboxes (`selectionMode` multiple or single), and a row's "Actions" menu names its row. On a phone a table becomes cards -
 * nothing is hidden or cut. The selection is the `value` output; a row action is the `action` output. Header, row and cell elements are real table elements,
 * so a screen reader announces the row and column of the cell it is on.
 */
export function DataList({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const columns = useMemo(() => readListColumns(element.properties.columns), [element.properties.columns]);
    const rows = useMemo(() => (Array.isArray(element.properties.rows) ? (element.properties.rows as unknown[]).filter((row): row is ListRow => typeof row === 'object' && row !== null && !Array.isArray(row)) : []), [element.properties.rows]);
    const idField = readOptionalString(element, 'idField') ?? 'id';
    const titleField = readOptionalString(element, 'titleField') ?? columns[0]?.field ?? idField;
    const urlKey = readOptionalString(element, 'urlKey');
    const keyed = (name: string) => (urlKey === undefined ? undefined : `${urlKey}${name}`);
    const [searchText, setSearchText] = useUrlState(keyed('q'), readOptionalString(element, 'search'));
    const [sortText, setSortText] = useUrlState(keyed('sort'), readOptionalString(element, 'sort'));
    const [pageText, setPageText] = useUrlState(keyed('page'), '1');
    const [selectedText, setSelectedText] = useUrlState(keyed('selected'), readOptionalString(element, 'selected'));
    const [openGroups, setOpenGroups] = useState<Set<string> | undefined>();
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const compact = useCompactWidth();
    const requestedVariant = readListVariant(element.properties.variant);
    const variant = requestedVariant === ListVariant.Table && compact && element.properties.collapse !== false ? ListVariant.Cards : requestedVariant;
    const pageSize = typeof element.properties.pageSize === 'number' ? element.properties.pageSize : 0;
    const multiple = element.properties.selectionMode !== 'single';
    const selectable = element.properties.selectionMode === 'multiple' || element.properties.selectionMode === 'single';
    const actions = Array.isArray(element.properties.rowActions) ? element.properties.rowActions.filter((action): action is string => typeof action === 'string') : [];
    const actionRule = readPermissionRule(element, 'actionPermission');
    const groupBy = readOptionalString(element, 'groupBy');
    const totalField = readOptionalString(element, 'totalField');
    const imageField = readOptionalString(element, 'imageField');
    const toneField = readOptionalString(element, 'toneField');
    const sort = parseSort(sortText, columns);

    const matching = useMemo(() => filterRows(searchRows(rows, columns, searchText ?? ''), element.properties.filter), [rows, columns, searchText, element.properties.filter]);
    const sorted = useMemo(() => sortRows(matching, sort, locale), [matching, sort?.field, sort?.descending, locale]);
    const page = paginate(sorted, Number(pageText), variant === ListVariant.Grouped ? 0 : pageSize);
    const selected = parseSelection(selectedText);
    const state = readComponentState(element, rows.length > 0);

    useEffect(() => { if (Number(pageText) !== page.page && pageText !== undefined) setPageText(String(page.page)); }, [page.page, pageText, setPageText]);
    useValueOutput(bindingOutputs, multiple ? selected : selected[0]);

    const select = (id: string) => { setSelectedText(toggleSelection(selected, id, multiple).join(',') || undefined); interactions?.onSelect?.(); };
    const run = (action: string, id: string) => { bindingOutputs?.setOutput('action', { action, row: id }); interactions?.onClick?.({ stopPropagation: () => undefined }); };
    const sortLabel = (column: ListColumn) => (sort?.field === column.field ? `${column.header}, ${sort.descending ? strings.listSortedDescending : strings.listSortedAscending}` : column.header);
    const nameOf = (row: ListRow, index: number) => textOf(row, titleField) || rowId(row, index, idField);
    const allOnPage = page.rows.length > 0 && page.rows.every((row, index) => selected.includes(rowId(row, index, idField)));
    const count = matching.length === rows.length ? formatText(strings.listCount, { count: rows.length }) : formatText(strings.listCountFiltered, { shown: matching.length, total: rows.length });

    const rowActions = (row: ListRow, index: number) => actions.length === 0 || actionRule === 'hidden' ? undefined : (
        <select className='foundation-row-actions' aria-label={formatText(strings.listRowActions, { name: nameOf(row, index) })} value='' disabled={actionRule === 'disabled'} title={actionRule === 'disabled' ? strings.disabledNoPermission : undefined}
            onChange={event => { if (event.target.value) run(event.target.value, rowId(row, index, idField)); }}>
            <option value=''>{strings.listActions}</option>
            {actions.map(action => <option key={action} value={action}>{action}</option>)}
        </select>
    );

    const checkbox = (row: ListRow, index: number) => !selectable ? undefined : (
        <input type={multiple ? 'checkbox' : 'radio'} name={`${element.id}-select`} checked={selected.includes(rowId(row, index, idField))} aria-label={formatText(strings.listSelectRow, { name: nameOf(row, index) })} onChange={() => select(rowId(row, index, idField))} />
    );

    // A row's tone is an emphasis, never the only cue: a status column carries the same fact as an icon and words.
    const toneOf = (row: ListRow): string | undefined => (toneField === undefined ? undefined : textOf(row, toneField) || undefined);

    // The picture of a card: the row's image, or its initials when it has none. The title beside it names the row, so the picture is decorative.
    const picture = (row: ListRow, index: number) => {
        if (imageField === undefined) return undefined;
        const source = textOf(row, imageField);
        return <div className='foundation-card-picture' aria-hidden='true'>{source ? <img src={source} alt='' loading='lazy' /> : <span>{initialsOf(nameOf(row, index))}</span>}</div>;
    };

    const table = (tableRows: ListRow[], offset = 0, caption?: string) => (
        <div className='foundation-table-scroll'>
            <table className='foundation-table'>
                <caption className='foundation-visually-hidden'>{caption ?? readOptionalString(element, 'label') ?? strings.listTable}</caption>
                <thead>
                    <tr>
                        {selectable && (
                            <th scope='col' className='foundation-table-select'>
                                {multiple && <input type='checkbox' checked={allOnPage} aria-label={strings.listSelectAll}
                                    onChange={() => setSelectedText((allOnPage ? selected.filter(id => !page.rows.some((row, index) => rowId(row, index, idField) === id)) : [...new Set([...selected, ...page.rows.map((row, index) => rowId(row, index, idField))])]).join(',') || undefined)} />}
                            </th>
                        )}
                        {columns.map(column => (
                            <th key={column.field} scope='col' aria-sort={sort?.field === column.field ? (sort.descending ? 'descending' : 'ascending') : undefined}>
                                {column.sortable ? (
                                    <button type='button' className='foundation-sort' aria-label={formatText(strings.listSortBy, { column: sortLabel(column) })} onClick={() => { setSortText(formatSort(nextSort(sort, column.field))); setPageText('1'); }}>
                                        <span>{column.header}</span>
                                        {sort?.field === column.field && <FoundationIcon name={sort.descending ? 'arrow-down' : 'arrow-up'} />}
                                    </button>
                                ) : column.header}
                            </th>
                        ))}
                        {actions.length > 0 && actionRule !== 'hidden' && <th scope='col'><span className='foundation-visually-hidden'>{strings.listActions}</span></th>}
                    </tr>
                </thead>
                <tbody>
                    {tableRows.map((row, position) => {
                        const index = offset + position;
                        const id = rowId(row, index, idField);
                        return (
                            <tr key={id} aria-selected={selectable ? selected.includes(id) : undefined} data-selected={selected.includes(id)} data-tone={toneOf(row)}>
                                {selectable && <td className='foundation-table-select'>{checkbox(row, index)}</td>}
                                {columns.map((column, columnIndex) => columnIndex === 0
                                    ? <th key={column.field} scope='row'><Cell column={column} row={row} locale={locale} /></th>
                                    : <td key={column.field} data-kind={column.kind}><Cell column={column} row={row} locale={locale} /></td>)}
                                {actions.length > 0 && actionRule !== 'hidden' && <td>{rowActions(row, index)}</td>}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const cards = (cardRows: ListRow[], offset = 0) => (
        <ul className='foundation-cards' aria-label={readOptionalString(element, 'label') ?? strings.listCards}>
            {cardRows.map((row, position) => {
                const index = offset + position;
                const id = rowId(row, index, idField);
                return (
                    <li key={id} className='foundation-card-row' data-selected={selected.includes(id)} data-tone={toneOf(row)}>
                        {picture(row, index)}
                        <div className='foundation-card-head'>{checkbox(row, index)}<strong>{nameOf(row, index)}</strong></div>
                        <dl>
                            {columns.filter(column => column.field !== titleField).map(column => (
                                <div key={column.field}><dt className='foundation-count'>{column.header}</dt><dd><Cell column={column} row={row} locale={locale} /></dd></div>
                            ))}
                        </dl>
                        {rowActions(row, index)}
                    </li>
                );
            })}
        </ul>
    );

    const groups = variant === ListVariant.Grouped && groupBy ? groupRows(sorted, groupBy, totalField) : [];
    const isOpen = (key: string) => (openGroups === undefined ? true : openGroups.has(key));
    const toggleGroup = (key: string) => setOpenGroups(current => { const base = current ?? new Set(groups.map(group => group.key)); const next = new Set(base); if (next.has(key)) next.delete(key); else next.add(key); return next; });
    const totalColumn = columns.find(column => column.field === totalField);

    return (
        <FoundationFrame element={element} interactions={interactions} name='data-list' state={state} skeleton={[100, 100, 100, 100]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <>
                    <p className='foundation-count' role='status'>{count}</p>
                    {matching.length === 0 ? (
                        <div className='foundation-empty' role='status'>
                            <strong className='foundation-empty-headline'>{strings.listNoMatches}</strong>
                            <button type='button' className='foundation-link' onClick={() => { setSearchText(undefined); setPageText('1'); interactions?.onChange?.(); }}>{strings.listClearSearch}</button>
                        </div>
                    ) : variant === ListVariant.Grouped && groupBy ? groups.map(group => (
                        <section key={group.key} className='foundation-list-group'>
                            <h3>
                                <button type='button' aria-expanded={isOpen(group.key)} className='foundation-sort' onClick={() => toggleGroup(group.key)}
                                    aria-label={formatText(isOpen(group.key) ? strings.listGroupCollapse : strings.listGroupExpand, { group: group.key })}>
                                    <FoundationIcon name={isOpen(group.key) ? 'chevron-down' : 'chevron-right'} />{group.key}
                                </button>
                                <span className='foundation-count'>{group.subtotal === undefined ? group.rows.length : formatText(strings.listGroupSubtotal, { count: group.rows.length, total: formatNumber(group.subtotal, locale, totalColumn?.kind === CellKind.Currency ? NumberFormat.Currency : NumberFormat.Number, totalColumn?.currency ?? 'USD') })}</span>
                            </h3>
                            {isOpen(group.key) && table(group.rows, 0, group.key)}
                        </section>
                    )) : (
                        <>
                            {variant === ListVariant.Cards ? cards(page.rows, (page.page - 1) * Math.max(1, pageSize)) : table(page.rows, (page.page - 1) * Math.max(1, pageSize))}
                            {page.pages > 1 && (
                                <nav className='foundation-pager' aria-label={formatText(strings.listPage, { page: page.page, pages: page.pages })}>
                                    <button type='button' className='foundation-button' data-emphasis='secondary' disabled={page.page <= 1} onClick={() => setPageText(String(page.page - 1))}>{strings.listPrevious}</button>
                                    <span aria-current='page'>{formatText(strings.listPage, { page: page.page, pages: page.pages })}</span>
                                    <button type='button' className='foundation-button' data-emphasis='secondary' disabled={page.page >= page.pages} onClick={() => setPageText(String(page.page + 1))}>{strings.listNext}</button>
                                </nav>
                            )}
                        </>
                    )}
                </>
            )}
        </FoundationFrame>
    );
}

