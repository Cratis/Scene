// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Knob } from 'primereact/knob';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:knob` component - a circular value picker that doubles as a readout.
 */
export function PrimeKnob({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(numberProperty(element, 'value', 0));
    return (
        <Knob
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value)}
            min={numberProperty(element, 'min', 0)}
            max={numberProperty(element, 'max', 100)}
            step={numberProperty(element, 'step', 1)}
            size={numberProperty(element, 'size', 100)}
            readOnly={booleanProperty(element, 'readOnly', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
