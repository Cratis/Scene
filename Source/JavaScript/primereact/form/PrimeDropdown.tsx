// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:dropdown` component - a single-choice select.
 *
 * Options are normalized by `optionsProperty`, so a screen may write either bare strings or
 * `{ label, value }` records and get the same result.
 *
 * In PrimeReact 11 this component is renamed `Select`; see the migration notes in the package
 * documentation.
 */
export function PrimeDropdown({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string | undefined>(stringProperty(element, 'value'));
    return (
        <Dropdown
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            placeholder={stringProperty(element, 'placeholder', 'Select')}
            filter={booleanProperty(element, 'filter', false)}
            showClear={booleanProperty(element, 'showClear', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
