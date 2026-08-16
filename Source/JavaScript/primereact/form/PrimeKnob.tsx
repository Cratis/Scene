// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Knob } from 'primereact/knob';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:knob` component - a circular value picker that doubles as a readout.
 *
 * `Knob.Root` draws the `<svg>` and its children are what goes inside it: `Range` is the full arc,
 * `Value` the filled portion of it, and `Text` the number in the middle. All three are required for the
 * knob to look like one - the root contributes only the canvas and the pointer handling - and `Text`
 * prints the current value when given no children, which is exactly what a readout wants.
 */
export function PrimeKnob({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(numberProperty(element, 'value', 0));
    return (
        <Knob.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value ?? 0)}
            min={numberProperty(element, 'min', 0)}
            max={numberProperty(element, 'max', 100)}
            step={numberProperty(element, 'step', 1)}
            size={numberProperty(element, 'size', 100)}
            readOnly={booleanProperty(element, 'readOnly', false)}
            disabled={booleanProperty(element, 'disabled', false)}>
            <Knob.Range />
            <Knob.Value />
            <Knob.Text />
        </Knob.Root>
    );
}
