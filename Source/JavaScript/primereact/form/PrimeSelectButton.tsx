// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:selectButton` component - a small set of choices shown as joined toggle buttons.
 *
 * In PrimeReact 11 this component is renamed `ToggleButtonGroup`.
 */
export function PrimeSelectButton({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringProperty(element, 'value'));
    return (
        <SelectButton
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            multiple={booleanProperty(element, 'multiple', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
