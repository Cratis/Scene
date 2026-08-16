// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, optionsProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:autoComplete` component - a text field that suggests from a known set as you type.
 *
 * AutoComplete has no built-in filtering: it asks the host to produce suggestions through
 * `completeMethod`, because in a real application that is a server call. A Scene element cannot express
 * a server call, so the adapter filters the authored `options` case-insensitively instead - enough for
 * the component to behave like itself in a preview, and honest about where the data came from.
 */
export function PrimeAutoComplete({ element }: RegisteredComponentProps) {
    const options = optionsProperty(element, 'options');
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    const [suggestions, setSuggestions] = useState<string[]>([]);

    return (
        <AutoComplete
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(typeof event.value === 'string' ? event.value : '')}
            suggestions={suggestions}
            completeMethod={(event) =>
                setSuggestions(options.filter((option) => option.label.toLowerCase().includes(event.query.toLowerCase())).map((option) => option.label))
            }
            dropdown={booleanProperty(element, 'dropdown', false)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
