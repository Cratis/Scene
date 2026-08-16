// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Select } from 'primereact/select';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:multiSelect` component - a multiple-choice select.
 *
 * There is no `MultiSelect` in PrimeReact 11; the capability moved onto `Select`, which takes a
 * `multiple` prop. Keeping the abstract name and re-expressing it over `Select` is the whole point of
 * having an abstract name: a screen that says `multiSelect` keeps working, and only this file knows the
 * component behind it changed.
 *
 * Two v10 properties have nowhere to go and are deliberately dropped rather than silently ignored.
 * `display` chose between a comma-separated summary and a row of chips, and `maxSelectedLabels` collapsed
 * a long selection into an "n items selected" label - both were features of v10's own selection renderer.
 * v11 renders the selection through `Select.Value`, which joins the selected labels with commas and
 * offers no chip mode and no collapse threshold, so honoring either property would mean reimplementing
 * the value slot rather than configuring it.
 */
export function PrimeMultiSelect({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringArrayProperty(element, 'value'));
    const placeholder = stringProperty(element, 'placeholder', 'Select');
    const filter = booleanProperty(element, 'filter', false);
    return (
        <Select.Root
            data-scene-id={element.id}
            multiple
            value={value}
            onValueChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            filter={filter}
            disabled={booleanProperty(element, 'disabled', false)}>
            <Select.Trigger>
                <Select.Value placeholder={placeholder} />
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
