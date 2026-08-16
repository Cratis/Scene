// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { ToggleSwitch } from 'primereact/toggleswitch';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:toggleSwitch` component.
 *
 * The abstract name has always been `toggleSwitch` even while PrimeReact 10 called the component
 * `InputSwitch` - a Scene name follows what the thing is rather than what one library happens to call it
 * this major version - and v11 renaming it `ToggleSwitch` is the library catching up rather than the
 * package moving.
 *
 * `Root` renders the hidden checkbox that carries the state and the accessible name, and the visible
 * switch is `Control` plus the `Handle` that slides inside it. That is why `inputId` and not `id` is what
 * the label points at: the label has to reach the input, not the wrapper.
 */
export function PrimeToggleSwitch({ element }: RegisteredComponentProps) {
    const [checked, setChecked] = useState(booleanProperty(element, 'checked', false));
    const label = stringProperty(element, 'label');
    return (
        <div data-scene-id={element.id} className='flex items-center gap-2'>
            <ToggleSwitch.Root
                inputId={element.id}
                checked={checked}
                onCheckedChange={(event) => setChecked(event.checked)}
                disabled={booleanProperty(element, 'disabled', false)}>
                <ToggleSwitch.Control>
                    <ToggleSwitch.Handle />
                </ToggleSwitch.Control>
            </ToggleSwitch.Root>
            {label !== undefined && <label htmlFor={element.id}>{label}</label>}
        </div>
    );
}
