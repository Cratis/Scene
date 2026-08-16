// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputMask } from 'primereact/inputmask';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inputMask` component - a text field constrained to a fixed pattern.
 *
 * Defaults to a phone-number mask so an element authored with nothing but a name still demonstrates
 * what a mask does; a real screen always supplies its own `mask`.
 */
export function PrimeInputMask({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    return (
        <InputMask
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.target.value ?? '')}
            mask={stringProperty(element, 'mask', '(999) 999-9999')}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
