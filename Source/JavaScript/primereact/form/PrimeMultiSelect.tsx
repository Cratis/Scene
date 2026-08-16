// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:multiSelect` component - a multiple-choice select with a checkbox list.
 */
export function PrimeMultiSelect({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string[]>(stringArrayProperty(element, 'value'));
    return (
        <MultiSelect
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            display={stringProperty(element, 'display', 'comma') as 'comma' | 'chip'}
            placeholder={stringProperty(element, 'placeholder', 'Select')}
            filter={booleanProperty(element, 'filter', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
