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
 */
export function PrimeSlider({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(numberProperty(element, 'value', 50));
    return (
        <div data-scene-id={element.id} className='w-64'>
            <Slider
                value={value}
                onChange={(event) => setValue(typeof event.value === 'number' ? event.value : value)}
                min={numberProperty(element, 'min', 0)}
                max={numberProperty(element, 'max', 100)}
                step={numberProperty(element, 'step', 1)}
                disabled={booleanProperty(element, 'disabled', false)}
            />
        </div>
    );
}
