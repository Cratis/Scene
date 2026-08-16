// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { DataView } from 'primereact/dataview';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, recordArrayProperty, stringProperty } from '../properties';
import { Pagination } from './Pagination';

/**
 * The `PrimeReact:dataView` component - the same rows a table would show, laid out as a list of cards.
 *
 * PrimeReact 11 reduced `DataView` to a layout shell: a root that tracks nothing but the list/grid
 * layout, and header, content, empty and footer slots. It no longer takes the rows, so it can no longer
 * template them, page them, or decide when the list is empty - all three now belong to the caller. The
 * adapter therefore renders the cards itself from the `titleField` and `descriptionField` properties,
 * shows the empty slot when there are no rows, and slices the rows for the page the user is on.
 *
 * Owning the page locally is the same trade {@link PrimePaginator} makes: a Scene element has nowhere to
 * record which page is showing, and a preview where paging does nothing would be worse than one where it
 * works but is forgotten on reload.
 */
export function PrimeDataView({ element }: RegisteredComponentProps) {
    const rows = recordArrayProperty(element, 'rows');
    const titleField = stringProperty(element, 'titleField', 'title');
    const descriptionField = stringProperty(element, 'descriptionField', 'description');
    const pageSize = numberProperty(element, 'pageSize');
    const [page, setPage] = useState(1);
    const visible = pageSize === undefined ? rows : rows.slice((page - 1) * pageSize, page * pageSize);

    return (
        <DataView.Root data-scene-id={element.id}>
            <DataView.Content>
                {visible.map((row, index) => (
                    <div key={index} className='flex flex-col gap-1 p-3'>
                        <span className='font-semibold'>{String(row[titleField] ?? '')}</span>
                        <span className='text-sm opacity-75'>{String(row[descriptionField] ?? '')}</span>
                    </div>
                ))}
            </DataView.Content>
            {rows.length === 0 && <DataView.Empty>{stringProperty(element, 'emptyMessage', 'No records found')}</DataView.Empty>}
            {pageSize !== undefined && (
                <DataView.Footer>
                    <Pagination page={page} total={rows.length} itemsPerPage={pageSize} onPageChange={setPage} />
                </DataView.Footer>
            )}
        </DataView.Root>
    );
}
