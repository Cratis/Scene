// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Select } from 'primereact/select';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:dropdown` component - a single-choice select.
 *
 * Options are normalized by `optionsProperty`, so a screen may write either bare strings or
 * `{ label, value }` records and get the same result.
 *
 * PrimeReact calls this `Select`, and it is a composition rather than one component: `Root` owns the
 * value and the option model, `Trigger` is what the user clicks, and the list lives behind a `Portal` so
 * it escapes any clipping ancestor. `Select.List` renders `options` itself - there is no option mapping
 * here, and adding one would only duplicate what `optionLabel` / `optionValue` already say. The `appendTo`
 * and z-index juggling a dropdown inside a dialog used to need is gone with it: the portal stacks
 * correctly on its own.
 */
export function PrimeDropdown({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringProperty(element, 'value'));
    const placeholder = stringProperty(element, 'placeholder', 'Select');
    const filter = booleanProperty(element, 'filter', false);
    const showClear = booleanProperty(element, 'showClear', false);
    return (
        <Select.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            filter={filter}
            disabled={booleanProperty(element, 'disabled', false)}>
            <Select.Trigger>
                <Select.Value placeholder={placeholder} />
                {showClear && <Select.Clear />}
                <Select.Arrow />
            </Select.Trigger>
            <Select.Portal>
                <Select.Positioner>
                    <Select.Popup>
                        {filter && <Select.Filter placeholder={placeholder} />}
                        <Select.List />
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}
