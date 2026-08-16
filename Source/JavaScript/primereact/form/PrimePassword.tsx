// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Password } from 'primereact/password';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:password` component - a masked field with an optional strength meter.
 */
export function PrimePassword({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    return (
        <Password
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            feedback={booleanProperty(element, 'feedback', true)}
            toggleMask={booleanProperty(element, 'toggleMask', true)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
