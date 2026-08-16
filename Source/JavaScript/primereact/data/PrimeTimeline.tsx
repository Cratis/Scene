// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Timeline } from 'primereact/timeline';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:timeline` component - events laid out along an axis.
 *
 * Supplies its own content and opposite templates from the `titleField`, `descriptionField` and
 * `dateField` properties, because Timeline renders only the connector line without them.
 */
export function PrimeTimeline({ element }: RegisteredComponentProps) {
    const titleField = stringProperty(element, 'titleField', 'title');
    const descriptionField = stringProperty(element, 'descriptionField', 'description');
    const dateField = stringProperty(element, 'dateField', 'date');
    return (
        <Timeline
            data-scene-id={element.id}
            value={recordArrayProperty(element, 'events')}
            align={stringProperty(element, 'align', 'left') as 'left' | 'right' | 'alternate' | 'top' | 'bottom'}
            layout={stringProperty(element, 'layout', 'vertical') as 'vertical' | 'horizontal'}
            opposite={(event: Record<string, unknown>) => <span className='text-sm opacity-75'>{String(event[dateField] ?? '')}</span>}
            content={(event: Record<string, unknown>) => (
                <div className='flex flex-col'>
                    <span className='font-semibold'>{String(event[titleField] ?? '')}</span>
                    <span className='text-sm opacity-75'>{String(event[descriptionField] ?? '')}</span>
                </div>
            )}
        />
    );
}
