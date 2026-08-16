// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { ToggleButton } from 'primereact/togglebutton';
import { ToggleButtonGroup } from 'primereact/togglebuttongroup';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:selectButton` component - a small set of choices shown as joined toggle buttons.
 * PrimeReact 11 calls it `ToggleButtonGroup`.
 *
 * v10 took the choices as an `options` array and rendered the buttons itself; v11 takes them as children,
 * so the mapping that used to be `optionLabel` / `optionValue` is a `map` here. The group still owns the
 * selection - each `ToggleButton` only declares its `value` and reads its pressed state from the group's
 * context - which is what keeps `multiple` a single prop on the group rather than a rule every button
 * would otherwise have to agree on.
 */
export function PrimeSelectButton({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringProperty(element, 'value'));
    return (
        <ToggleButtonGroup
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value)}
            multiple={booleanProperty(element, 'multiple', false)}
            disabled={booleanProperty(element, 'disabled', false)}>
            {optionsProperty(element, 'options').map((option) => (
                <ToggleButton.Root key={option.value} value={option.value}>
                    {option.label}
                </ToggleButton.Root>
            ))}
        </ToggleButtonGroup>
    );
}
