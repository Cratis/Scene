// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Carousel } from 'primereact/carousel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:carousel` component - a row of items paged through horizontally.
 *
 * Supplies an item template from the `titleField` and `descriptionField` properties, for the same reason
 * `dataView` does: without one, every item renders empty.
 */
export function PrimeCarousel({ element }: RegisteredComponentProps) {
    const titleField = stringProperty(element, 'titleField', 'title');
    const descriptionField = stringProperty(element, 'descriptionField', 'description');
    return (
        <Carousel
            data-scene-id={element.id}
            value={recordArrayProperty(element, 'items')}
            numVisible={numberProperty(element, 'numVisible', 3)}
            numScroll={numberProperty(element, 'numScroll', 1)}
            circular={booleanProperty(element, 'circular', false)}
            itemTemplate={(item: Record<string, unknown>) => (
                <div className='m-2 flex flex-col gap-1 border p-3'>
                    <span className='font-semibold'>{String(item[titleField] ?? '')}</span>
                    <span className='text-sm opacity-75'>{String(item[descriptionField] ?? '')}</span>
                </div>
            )}
        />
    );
}
