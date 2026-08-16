// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment } from 'react';
import { Splitter } from 'primereact/splitter';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:splitter` component - regions separated by a bar the user can drag.
 *
 * One panel per child in the `content` slot, sized evenly. Splitter needs an explicit height because it
 * lays its panels out absolutely; without one the whole component collapses.
 *
 * PrimeReact 11 moved sizing off the individual panel and onto the root: a v10 `SplitterPanel size={50}`
 * is now one entry in the root's `defaultSizes` array, so the even split is computed once up front rather
 * than repeated per panel. It also stopped inserting the drag bars for you - `Splitter.Gutter` is a part
 * the composition supplies between panels, and a splitter rendered without them is simply not resizable.
 * `defaultSizes` is used rather than `sizes` so the component owns its sizes after the first drag; the
 * controlled form would snap the panels back to the even split on every render.
 *
 * The Scene property keeps the name `layout` even though v11 calls the prop `orientation`, because a
 * screen's property vocabulary is this package's contract with authored content.
 */
export function PrimeSplitter({ element, slots }: RegisteredComponentProps) {
    const panels = slots.content ?? [];
    const count = Math.max(panels.length, 2);
    return (
        <Splitter.Root
            data-scene-id={element.id}
            orientation={stringProperty(element, 'layout', 'horizontal') as 'horizontal' | 'vertical'}
            defaultSizes={Array.from({ length: count }, () => 100 / count)}
            style={{ height: `${numberProperty(element, 'height', 200)}px` }}>
            {Array.from({ length: count }, (_, index) => (
                <Fragment key={index}>
                    {index > 0 && (
                        <Splitter.Gutter>
                            <Splitter.Handle />
                        </Splitter.Gutter>
                    )}
                    <Splitter.Panel className='flex items-center justify-center'>{panels[index]}</Splitter.Panel>
                </Fragment>
            ))}
        </Splitter.Root>
    );
}
