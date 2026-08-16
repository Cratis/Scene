// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { SelectOption } from '../SelectOption';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:autoComplete` component - a text field that suggests from a known set as you type.
 *
 * AutoComplete has no built-in filtering: it asks the host to narrow the list through `onComplete`,
 * because in a real application that is a server call. A Scene element cannot express a server call, so
 * the adapter filters the authored `options` case-insensitively instead - enough for the component to
 * behave like itself in a preview, and honest about where the data came from.
 *
 * PrimeReact 11 renamed the two halves of that arrangement: the narrowed list is `options` (v10 called it
 * `suggestions`) and the callback is `onComplete` (v10's `completeMethod`), and `AutoComplete.List`
 * renders the list itself from `optionLabel` / `optionValue`. The v10 `dropdown` flag is gone as a prop
 * for the same reason it is gone from every other v11 overlay: the button either exists in the
 * composition or it does not, so the property now decides whether to render `AutoComplete.Trigger`.
 */
export function PrimeAutoComplete({ element }: RegisteredComponentProps) {
    const all = optionsProperty(element, 'options');
    const [options, setOptions] = useState<SelectOption[]>(all);

    return (
        <AutoComplete.Root
            data-scene-id={element.id}
            options={options}
            optionLabel='label'
            optionValue='value'
            defaultInputValue={stringProperty(element, 'value', '')}
            onComplete={(event) => setOptions(all.filter((option) => option.label.toLowerCase().includes(event.query.toLowerCase())))}
            disabled={booleanProperty(element, 'disabled', false)}>
            <AutoComplete.Input placeholder={stringProperty(element, 'placeholder')} />
            {booleanProperty(element, 'dropdown', false) && (
                <AutoComplete.Trigger>
                    <i className='pi pi-chevron-down' />
                </AutoComplete.Trigger>
            )}
            <AutoComplete.Portal>
                <AutoComplete.Positioner>
                    <AutoComplete.Popup>
                        <AutoComplete.List />
                    </AutoComplete.Popup>
                </AutoComplete.Positioner>
            </AutoComplete.Portal>
        </AutoComplete.Root>
    );
}
