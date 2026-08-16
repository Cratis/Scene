// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DataView } from 'primereact/dataview';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:dataView` component - the same rows a table would show, laid out as a list of cards.
 *
 * DataView has no default item template, so the adapter supplies one built from the `titleField` and
 * `descriptionField` properties. Without it every row would render empty and the component would look
 * broken rather than unconfigured.
 */
export function PrimeDataView({ element }: RegisteredComponentProps) {
    const titleField = stringProperty(element, 'titleField', 'title');
    const descriptionField = stringProperty(element, 'descriptionField', 'description');
    const pageSize = numberProperty(element, 'pageSize');
    return (
        <DataView
            data-scene-id={element.id}
            value={recordArrayProperty(element, 'rows')}
            emptyMessage={stringProperty(element, 'emptyMessage', 'No records found')}
            paginator={pageSize !== undefined}
            rows={pageSize}
            itemTemplate={(row: Record<string, unknown>) => (
                <div className='flex flex-col gap-1 p-3'>
                    <span className='font-semibold'>{String(row[titleField] ?? '')}</span>
                    <span className='text-sm opacity-75'>{String(row[descriptionField] ?? '')}</span>
                </div>
            )}
        />
    );
}
