// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:toggleSwitch` component.
 *
 * The abstract name is `toggleSwitch` while PrimeReact 10 calls the component `InputSwitch` - the Scene
 * name follows what the thing is rather than what one library happens to call it this major version.
 * PrimeReact 11 renames it `ToggleSwitch`, so the abstract name already matches where the library is
 * going and the port changes only this file's import.
 */
export function PrimeToggleSwitch({ element }: RegisteredComponentProps) {
    const [checked, setChecked] = useState(booleanProperty(element, 'checked', false));
    const label = stringProperty(element, 'label');
    return (
        <div data-scene-id={element.id} className='flex items-center gap-2'>
            <InputSwitch
                inputId={element.id}
                checked={checked}
                onChange={(event) => setChecked(event.value)}
                disabled={booleanProperty(element, 'disabled', false)}
            />
            {label !== undefined && <label htmlFor={element.id}>{label}</label>}
        </div>
    );
}
