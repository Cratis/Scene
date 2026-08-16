// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:checkbox` component.
 *
 * Rendered with its label rather than bare: an unlabeled checkbox has no accessible name and nothing to
 * click but a 20-pixel box, which is a defect in every screen that would ever use one.
 *
 * PrimeReact 11 makes the tick its own part: `Root` renders the real (visually hidden) input and owns the
 * state, `Box` is the square, and `Indicator` is what appears inside it when checked. The `checked` state
 * now arrives as `onCheckedChange` with a boolean rather than a change event whose `checked` might be
 * `undefined`, so the defensive `=== true` the v10 adapter needed is gone.
 */
export function PrimeCheckbox({ element }: RegisteredComponentProps) {
    const [checked, setChecked] = useState(booleanProperty(element, 'checked', false));
    const label = stringProperty(element, 'label');
    return (
        <div data-scene-id={element.id} className='flex items-center gap-2'>
            <Checkbox.Root
                inputId={element.id}
                checked={checked}
                onCheckedChange={(event) => setChecked(event.checked)}
                disabled={booleanProperty(element, 'disabled', false)}>
                <Checkbox.Box>
                    <Checkbox.Indicator />
                </Checkbox.Box>
            </Checkbox.Root>
            {label !== undefined && <label htmlFor={element.id}>{label}</label>}
        </div>
    );
}
