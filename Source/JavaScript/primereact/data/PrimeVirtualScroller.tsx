// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { VirtualScroller } from 'primereact/virtualscroller';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringArrayProperty } from '../properties';

/**
 * The `PrimeReact:virtualScroller` component - a long list that renders only the visible window.
 *
 * VirtualScroller needs a fixed `itemSize` and an explicitly sized viewport to know what to render; both
 * are supplied with defaults so an element authored with only `items` still scrolls rather than
 * collapsing to zero height.
 */
export function PrimeVirtualScroller({ element }: RegisteredComponentProps) {
    const itemSize = numberProperty(element, 'itemSize', 40);
    return (
        <VirtualScroller
            data-scene-id={element.id}
            items={stringArrayProperty(element, 'items')}
            itemSize={itemSize}
            className='w-64 border'
            style={{ height: `${numberProperty(element, 'height', 200)}px` }}
            itemTemplate={(item: string) => (
                <div className='flex items-center px-3' style={{ height: `${itemSize}px` }}>
                    {item}
                </div>
            )}
        />
    );
}
