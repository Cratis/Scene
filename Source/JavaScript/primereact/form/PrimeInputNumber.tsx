// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inputNumber` component - a numeric field with locale-aware formatting.
 *
 * `mode` and `currency` are passed straight through because that is where InputNumber earns its keep
 * over a plain text field: it formats and parses in the user's locale rather than making a screen do it.
 *
 * PrimeReact 11 splits the component in two: `Root` holds the number model and `Input` is the field it
 * formats into, which is also why `placeholder` moved onto the input rather than the root. `showButtons`
 * is no longer a flag the component interprets - the spinner is a `Group` of `Increment` and `Decrement`
 * you either render or do not - so the property now decides whether that group exists at all.
 */
export function PrimeInputNumber({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<number | undefined>(numberProperty(element, 'value'));
    const currency = stringProperty(element, 'currency');
    return (
        <InputNumber.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(typeof event.value === 'number' ? event.value : undefined)}
            mode={currency === undefined ? 'decimal' : 'currency'}
            currency={currency}
            min={numberProperty(element, 'min')}
            max={numberProperty(element, 'max')}
            disabled={booleanProperty(element, 'disabled', false)}>
            <InputNumber.Input placeholder={stringProperty(element, 'placeholder')} />
            {booleanProperty(element, 'showButtons', false) && (
                <InputNumber.Group>
                    <InputNumber.Increment>
                        <i className='pi pi-chevron-up' />
                    </InputNumber.Increment>
                    <InputNumber.Decrement>
                        <i className='pi pi-chevron-down' />
                    </InputNumber.Decrement>
                </InputNumber.Group>
            )}
        </InputNumber.Root>
    );
}
