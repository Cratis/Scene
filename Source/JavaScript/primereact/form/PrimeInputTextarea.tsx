// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ChangeEvent, useState } from 'react';
import { Textarea } from 'primereact/textarea';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inputTextarea` component - a multi-line text field, named `Textarea` by PrimeReact 11.
 *
 * One of the few components the version change left alone beyond its name: it is still a single element
 * rather than a composition, and `rows`, `cols` and `placeholder` still reach the underlying `<textarea>`
 * untouched. Holds the typed value locally for the same reason {@link PrimeInputText} does.
 */
export function PrimeInputTextarea({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    return (
        <Textarea
            data-scene-id={element.id}
            value={value}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
            rows={numberProperty(element, 'rows', 4)}
            cols={numberProperty(element, 'cols')}
            autoResize={booleanProperty(element, 'autoResize', false)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
