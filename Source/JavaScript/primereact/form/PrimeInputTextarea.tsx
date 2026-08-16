// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inputTextarea` component - a multi-line text field.
 *
 * Holds the typed value locally for the same reason {@link PrimeInputText} does.
 */
export function PrimeInputTextarea({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    return (
        <InputTextarea
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={numberProperty(element, 'rows', 4)}
            cols={numberProperty(element, 'cols')}
            autoResize={booleanProperty(element, 'autoResize', false)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
