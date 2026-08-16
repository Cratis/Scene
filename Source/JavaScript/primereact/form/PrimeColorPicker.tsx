// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { ColorPicker } from 'primereact/colorpicker';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:colorPicker` component.
 *
 * The value is kept as a hex string without the leading `#`, which is what ColorPicker's default
 * `hex` format expects; a screen writing `#6366f1` therefore still works.
 */
export function PrimeColorPicker({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', '6366f1').replace('#', ''));
    return (
        <ColorPicker
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(typeof event.value === 'string' ? event.value : value)}
            inline={booleanProperty(element, 'inline', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
