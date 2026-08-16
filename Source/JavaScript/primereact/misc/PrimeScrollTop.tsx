// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ScrollTop } from './ScrollTop';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:scrollTop` component - a button that returns the reader to the top.
 *
 * PrimeReact 11 removed `ScrollTop` with no replacement and no headless hook, so the adapter renders
 * Cratis's own {@link ScrollTop}. The element keeps the shape it had: a sized, scrollable box holding the
 * `content` slot, with the button watching that box rather than the window. A window-targeted button
 * inside a composed screen would scroll something the element does not own, and would stay invisible in
 * any preview shorter than a page.
 *
 * The box and the scrolling region are two elements rather than one, which is what lets the button sit
 * still while the content moves under it. Anchored inside the scroller it would drift off with the
 * content it is offering to escape.
 */
export function PrimeScrollTop({ element, slots }: RegisteredComponentProps) {
    const scroller = useRef<HTMLDivElement>(null);
    return (
        <div data-scene-id={element.id} className='relative'>
            <div ref={scroller} className='overflow-auto' style={{ height: `${numberProperty(element, 'height', 200)}px` }}>
                {slots.content}
            </div>
            <ScrollTop target={scroller} threshold={numberProperty(element, 'threshold', 100)} />
        </div>
    );
}
