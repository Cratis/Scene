// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';
import { Column } from './Column';

/**
 * The `PrimeReact:column` component - one column of a table.
 *
 * This renders {@link Column}, which is Cratis-owned rather than PrimeReact's: PrimeReact 11 removed
 * `primereact/column` along with the table that walked it. Like its predecessor it is configuration
 * rather than output - it renders nothing on its own and only means something inside a table - so a bare
 * `column` on a screen looking blank is the component working, not failing.
 *
 * When a `column` element is nested under `dataTable` or `table`, the table reads its properties off the
 * model rather than off this rendered output; see `columnDefinitions` for why that indirection exists and
 * why PrimeReact 11 did not change it.
 */
export function PrimeColumn({ element }: RegisteredComponentProps) {
    const field = stringProperty(element, 'field', '');
    return (
        <Column
            field={field}
            header={stringProperty(element, 'header', field)}
            sortable={booleanProperty(element, 'sortable', false)}
            filter={booleanProperty(element, 'filter', false)}
        />
    );
}
