// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactElement, ReactNode, isValidElement } from 'react';
import { DataTable, type DataTableFilterInstance, type DataTablePaginationInstance, type DataTableTBodyItemOptions } from 'primereact/datatable';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, recordArrayProperty, stringProperty } from '../properties';
import { Column, ColumnProps } from './Column';
import { columnDefinitions } from './columnDefinitions';

/**
 * The `PrimeReact:dataTable` component, also registered under Screenplay's `table` name so a screen
 * compiled from a `.play` file renders through this package without a translation step.
 *
 * PrimeReact 11 turned the table inside out. Where PrimeReact 10 took `value` and a set of `Column`
 * children and produced the whole table, PrimeReact 11 gives back a root that owns sorting, filtering and
 * paging and a set of parts - container, table, head, rows, cells - that the caller arranges. So this
 * adapter now writes out the table's structure itself, and the column concept it renders from is
 * {@link Column}, which is Cratis-owned because PrimeReact 11 removed `primereact/column` entirely.
 *
 * Columns are taken from `Column` declarations when a React caller composed some into a slot, and
 * otherwise from the element's model - nested `column` children, a `columns` property, or the shape of
 * the first row; see `columnDefinitions`. The model is the path a screen takes, and it is checked second
 * only because an explicitly composed declaration is the more specific statement of the two.
 */
export function PrimeDataTable({ element, slots }: RegisteredComponentProps) {
    const rows = recordArrayProperty(element, 'rows');
    const declared = declaredColumns(slots);
    const columns: ColumnProps[] = declared.length > 0 ? declared : columnDefinitions(element, rows);
    const pageSize = numberProperty(element, 'pageSize');
    const size = stringProperty(element, 'size');

    return (
        <DataTable.Root
            data-scene-id={element.id}
            data={rows}
            removableSort
            paginator={pageSize !== undefined}
            rows={pageSize}
            stripedRows={booleanProperty(element, 'stripedRows', false)}
            showGridlines={booleanProperty(element, 'showGridlines', false)}
            size={size === 'small' || size === 'large' ? size : undefined}>
            <DataTable.TableContainer>
                <DataTable.Table>
                    <DataTable.THead>
                        <DataTable.THeadRow>
                            {columns.map((column, index) => (
                                <DataTable.THeadCell key={column.field ?? index}>
                                    {column.sortable && column.field ? (
                                        <DataTable.Sort field={column.field}>
                                            {headerOf(column)}
                                            <DataTable.SortIndicator match='asc'> ▲</DataTable.SortIndicator>
                                            <DataTable.SortIndicator match='desc'> ▼</DataTable.SortIndicator>
                                        </DataTable.Sort>
                                    ) : (
                                        <span>{headerOf(column)}</span>
                                    )}
                                    {column.filter && column.field && (
                                        <DataTable.Filter field={column.field} display='row'>
                                            {(filter: DataTableFilterInstance) => (
                                                <input
                                                    className='w-full'
                                                    aria-label={`Filter by ${headerOf(column)}`}
                                                    value={typeof filter.value === 'string' ? filter.value : ''}
                                                    onChange={(event) => filter.onChange(event, event.target.value)}
                                                />
                                            )}
                                        </DataTable.Filter>
                                    )}
                                </DataTable.THeadCell>
                            ))}
                        </DataTable.THeadRow>
                    </DataTable.THead>
                    <DataTable.TBody>
                        {({ item, index }: DataTableTBodyItemOptions) => (
                            <DataTable.Row index={index}>
                                {columns.map((column, columnIndex) => (
                                    <DataTable.Cell key={column.field ?? columnIndex}>{cellOf(column, item)}</DataTable.Cell>
                                ))}
                            </DataTable.Row>
                        )}
                    </DataTable.TBody>
                    <DataTable.EmptyTBody>
                        <DataTable.Row>
                            <DataTable.Cell colSpan={Math.max(columns.length, 1)}>
                                {stringProperty(element, 'emptyMessage', 'No records found')}
                            </DataTable.Cell>
                        </DataTable.Row>
                    </DataTable.EmptyTBody>
                </DataTable.Table>
            </DataTable.TableContainer>
            <DataTable.Pagination>
                {(pagination: DataTablePaginationInstance) => (
                    <div className='flex items-center gap-2 p-2'>
                        <button
                            type='button'
                            disabled={!pagination.canPrev}
                            onClick={(event) => pagination.onPageChange(event, pagination.page - 1)}>
                            ‹
                        </button>
                        <span className='text-sm opacity-75'>
                            {pagination.page + 1} / {Math.max(pagination.pageCount, 1)}
                        </span>
                        <button
                            type='button'
                            disabled={!pagination.canNext}
                            onClick={(event) => pagination.onPageChange(event, pagination.page + 1)}>
                            ›
                        </button>
                    </div>
                )}
            </DataTable.Pagination>
        </DataTable.Root>
    );
}

function declaredColumns(slots: Record<string, ReactNode[]>): ColumnProps[] {
    return [...(slots.columns ?? []), ...(slots.content ?? [])]
        .filter((node): node is ReactElement<ColumnProps> => isValidElement(node) && node.type === Column)
        .map((node) => node.props);
}

function headerOf(column: ColumnProps): string {
    return column.header ?? column.field ?? '';
}

function cellOf(column: ColumnProps, row: Record<string, unknown>): ReactNode {
    if (column.body !== undefined) return column.body(row);
    if (column.field === undefined) return '';
    return String(row[column.field] ?? '');
}
