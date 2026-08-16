// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { ListBox } from 'primereact/listbox';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:listBox` component - an always-visible list of choices.
 *
 * The alternative to a dropdown when the choices matter enough to stay on screen; `multiple` switches it
 * between one and many.
 */
export function PrimeListBox({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringProperty(element, 'value'));
    return (
        <ListBox
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            multiple={booleanProperty(element, 'multiple', false)}
            filter={booleanProperty(element, 'filter', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
