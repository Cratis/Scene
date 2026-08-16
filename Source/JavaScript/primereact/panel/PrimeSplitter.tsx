// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Splitter, SplitterPanel } from 'primereact/splitter';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:splitter` component - regions separated by a bar the user can drag.
 *
 * One panel per child in the `content` slot, sized evenly. Splitter needs an explicit height because it
 * lays its panels out absolutely; without one the whole component collapses.
 */
export function PrimeSplitter({ element, slots }: RegisteredComponentProps) {
    const panels = slots.content ?? [];
    const count = Math.max(panels.length, 2);
    return (
        <Splitter
            data-scene-id={element.id}
            layout={stringProperty(element, 'layout', 'horizontal') as 'horizontal' | 'vertical'}
            style={{ height: `${numberProperty(element, 'height', 200)}px` }}>
            {Array.from({ length: count }, (_, index) => (
                <SplitterPanel key={index} size={100 / count} className='flex items-center justify-center'>
                    {panels[index]}
                </SplitterPanel>
            ))}
        </Splitter>
    );
}
