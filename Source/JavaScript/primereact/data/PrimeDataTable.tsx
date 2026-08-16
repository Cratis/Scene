// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, recordArrayProperty, stringProperty } from '../properties';
import { columnDefinitions } from './columnDefinitions';

/**
 * The `PrimeReact:dataTable` component, also registered under Screenplay's `table` name so a screen
 * compiled from a `.play` file renders through this package without a translation step.
 *
 * Rows come from a `rows` property; columns come from nested `column` children, a `columns` property, or
 * are inferred from the first row - see `columnDefinitions`.
 */
export function PrimeDataTable({ element }: RegisteredComponentProps) {
    const rows = recordArrayProperty(element, 'rows');
    const columns = columnDefinitions(element, rows);
    const pageSize = numberProperty(element, 'pageSize');
    return (
        <DataTable
            data-scene-id={element.id}
            value={rows}
            emptyMessage={stringProperty(element, 'emptyMessage', 'No records found')}
            stripedRows={booleanProperty(element, 'stripedRows', false)}
            showGridlines={booleanProperty(element, 'showGridlines', false)}
            size={stringProperty(element, 'size') as 'small' | 'normal' | 'large' | undefined}
            paginator={pageSize !== undefined}
            rows={pageSize}>
            {columns.map((column) => (
                <Column key={column.field} field={column.field} header={column.header} sortable={column.sortable} />
            ))}
        </DataTable>
    );
}
