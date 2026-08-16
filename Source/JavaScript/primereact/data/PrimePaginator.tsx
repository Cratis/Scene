// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';
import { Pagination } from './Pagination';

/**
 * The `PrimeReact:paginator` component - page navigation for a list a screen paginates itself.
 *
 * Owns the current page locally so the control is operable in a preview; a Scene element has no place to
 * record which page the user is on.
 *
 * The authored `first` property still names a record offset, as it did in PrimeReact 10, but PrimeReact
 * 11's paginator counts pages rather than records - so the offset is divided into a page number here,
 * with the page size floored at one so an authored zero cannot turn that division into a NaN page.
 * Keeping the property in record terms means a screen written for the previous version still lands on the
 * page it asked for. `rowsPerPageOptions` has no counterpart in PrimeReact 11 and is not carried over:
 * the new paginator has no rows-per-page control to put the options in.
 */
export function PrimePaginator({ element }: RegisteredComponentProps) {
    const pageSize = Math.max(numberProperty(element, 'pageSize', 10), 1);
    const [page, setPage] = useState(() => Math.floor(numberProperty(element, 'first', 0) / pageSize) + 1);
    return (
        <Pagination
            sceneId={element.id}
            page={page}
            total={numberProperty(element, 'totalRecords', 0)}
            itemsPerPage={pageSize}
            onPageChange={setPage}
        />
    );
}
