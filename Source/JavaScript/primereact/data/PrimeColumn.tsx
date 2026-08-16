// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Column } from 'primereact/column';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:column` component - one column of a table.
 *
 * Like PrimeReact's own `Column`, this is configuration rather than output: it renders nothing on its
 * own and only means something inside a table. That is not a Scene quirk - a bare `<Column/>` in
 * PrimeReact renders nothing either. When a `column` element is nested under `dataTable` or `table`,
 * the table reads its `field`, `header` and `sortable` properties off the model rather than using this
 * rendered output; see `columnDefinitions` for why.
 */
export function PrimeColumn({ element }: RegisteredComponentProps) {
    const field = stringProperty(element, 'field', '');
    return <Column field={field} header={stringProperty(element, 'header', field)} sortable={booleanProperty(element, 'sortable', false)} />;
}
