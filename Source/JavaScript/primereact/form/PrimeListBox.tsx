// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Listbox } from 'primereact/listbox';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:listBox` component - an always-visible list of choices.
 *
 * The alternative to a dropdown when the choices matter enough to stay on screen; `multiple` switches it
 * between one and many. `Listbox.List` renders `options` itself, so `optionLabel` / `optionValue` remain
 * the whole of the mapping and there is no per-option markup here.
 *
 * v10's `filter` property is not read. PrimeReact 11 ships a `Listbox.Filter` part, but it is only an
 * input wired for keyboard navigation - the root does no filtering of `options` at all, so switching it
 * on would render a search box that searches nothing. Filtering a list is the caller's to do, and a
 * design-time preview has no list long enough to need it.
 */
export function PrimeListBox({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringProperty(element, 'value'));
    return (
        <Listbox.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value)}
            options={optionsProperty(element, 'options')}
            optionLabel='label'
            optionValue='value'
            multiple={booleanProperty(element, 'multiple', false)}
            disabled={booleanProperty(element, 'disabled', false)}>
            <Listbox.List />
        </Listbox.Root>
    );
}
