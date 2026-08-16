// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Slider } from 'primereact/slider';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:slider` component - a value picked along a track.
 *
 * Given a width because Slider renders as a zero-height track that collapses to nothing in an
 * auto-sized container - the one piece of layout it cannot supply for itself.
 *
 * PrimeReact 11 exposes the track, the filled range and the handle as separate parts, which is what makes
 * a range slider a matter of rendering a second `Handle` rather than a `range` prop. This adapter renders
 * one, so the value stays a single number; `onValueChange` still reports `number[]` for the range case,
 * hence the narrowing on the way back in.
 */
export function PrimeSlider({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(numberProperty(element, 'value', 50));
    return (
        <div data-scene-id={element.id} className='w-64'>
            <Slider.Root
                value={value}
                onValueChange={(event) => setValue(typeof event.value === 'number' ? event.value : value)}
                min={numberProperty(element, 'min', 0)}
                max={numberProperty(element, 'max', 100)}
                step={numberProperty(element, 'step', 1)}
                disabled={booleanProperty(element, 'disabled', false)}>
                <Slider.Track>
                    <Slider.Range />
                </Slider.Track>
                <Slider.Handle />
            </Slider.Root>
        </div>
    );
}
