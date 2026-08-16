// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Paginator } from 'primereact/paginator';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:paginator` component - page navigation for a list a screen paginates itself.
 *
 * Owns the current page locally so the control is operable in a preview; a Scene element has no place to
 * record which page the user is on.
 */
export function PrimePaginator({ element }: RegisteredComponentProps) {
    const pageSize = numberProperty(element, 'pageSize', 10);
    const [first, setFirst] = useState(numberProperty(element, 'first', 0));
    const [rows, setRows] = useState(pageSize);
    return (
        <Paginator
            data-scene-id={element.id}
            first={first}
            rows={rows}
            totalRecords={numberProperty(element, 'totalRecords', 0)}
            rowsPerPageOptions={[pageSize, pageSize * 2, pageSize * 5]}
            onPageChange={(event) => {
                setFirst(event.first);
                setRows(event.rows);
            }}
        />
    );
}
