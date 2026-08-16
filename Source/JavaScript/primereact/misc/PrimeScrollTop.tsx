// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScrollTop } from 'primereact/scrolltop';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:scrollTop` component - a button that returns the reader to the top.
 *
 * Targets its own scrollable parent rather than the window, and the adapter provides that parent. A
 * window-targeted ScrollTop inside a composed screen would scroll something the element does not own,
 * and would stay invisible in any preview shorter than a page.
 *
 * In PrimeReact 11 this becomes a hook rather than a component.
 */
export function PrimeScrollTop({ element, slots }: RegisteredComponentProps) {
    return (
        <div data-scene-id={element.id} className='relative overflow-auto' style={{ height: `${numberProperty(element, 'height', 200)}px` }}>
            {slots.content}
            <ScrollTop target='parent' threshold={numberProperty(element, 'threshold', 100)} />
        </div>
    );
}
