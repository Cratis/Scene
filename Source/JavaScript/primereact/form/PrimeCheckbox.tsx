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
 */
export function PrimeCheckbox({ element }: RegisteredComponentProps) {
    const [checked, setChecked] = useState(booleanProperty(element, 'checked', false));
    const label = stringProperty(element, 'label');
    return (
        <div data-scene-id={element.id} className='flex items-center gap-2'>
            <Checkbox
                inputId={element.id}
                checked={checked}
                onChange={(event) => setChecked(event.checked === true)}
                disabled={booleanProperty(element, 'disabled', false)}
            />
            {label !== undefined && <label htmlFor={element.id}>{label}</label>}
        </div>
    );
}
