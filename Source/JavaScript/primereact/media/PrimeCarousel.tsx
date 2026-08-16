// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Carousel } from 'primereact/carousel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:carousel` component - a row of items paged through horizontally.
 *
 * The item body is built from the `titleField` and `descriptionField` properties, for the same reason
 * `dataView` does it: the element carries records, not markup, and something has to decide which two
 * fields a reader sees. PrimeReact 11 takes that as children rather than as an `itemTemplate` callback,
 * which is why the mapping is written out here instead of passed in.
 *
 * v10's `numScroll` has no v11 counterpart and is not read: the new carousel scrolls by a page, and a page
 * is `numVisible` items. Honoring a `numScroll` that differs from it would mean re-implementing paging
 * against a component that has its own.
 *
 * Navigation and page indicators appear only when there is more than one page's worth of items. A control
 * that cannot do anything is worse than an absent one - it invites a click and answers with nothing.
 */
export function PrimeCarousel({ element }: RegisteredComponentProps) {
    const items = recordArrayProperty(element, 'items');
    const titleField = stringProperty(element, 'titleField', 'title');
    const descriptionField = stringProperty(element, 'descriptionField', 'description');
    const numVisible = numberProperty(element, 'numVisible', 3);
    return (
        <Carousel.Root data-scene-id={element.id} slidesPerPage={numVisible} loop={booleanProperty(element, 'circular', false)}>
            <Carousel.Content>
                {items.map((item, index) => (
                    <Carousel.Item key={index}>
                        <div className='m-2 flex flex-col gap-1 border p-3'>
                            <span className='font-semibold'>{String(item[titleField] ?? '')}</span>
                            <span className='text-sm opacity-75'>{String(item[descriptionField] ?? '')}</span>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel.Content>
            {items.length > numVisible && (
                <>
                    <Carousel.Prev aria-label='Previous items'>
                        <i className='pi pi-chevron-left' aria-hidden='true' />
                    </Carousel.Prev>
                    <Carousel.Next aria-label='Next items'>
                        <i className='pi pi-chevron-right' aria-hidden='true' />
                    </Carousel.Next>
                    <Carousel.Indicators />
                </>
            )}
        </Carousel.Root>
    );
}
