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
 */
export function PrimeInputNumber({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<number | undefined>(numberProperty(element, 'value'));
    const currency = stringProperty(element, 'currency');
    return (
        <InputNumber
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(typeof event.value === 'number' ? event.value : undefined)}
            mode={currency === undefined ? 'decimal' : 'currency'}
            currency={currency}
            min={numberProperty(element, 'min')}
            max={numberProperty(element, 'max')}
            showButtons={booleanProperty(element, 'showButtons', false)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
