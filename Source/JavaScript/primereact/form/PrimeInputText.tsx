// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inputText` component - a single-line text field.
 *
 * PrimeReact inputs are controlled, and a Scene element has nowhere to put "what the user has typed so
 * far" - `properties` is authored design-time configuration, not live state. The adapter therefore owns
 * that state locally, seeded from the `value` property. The consequence is deliberate and worth knowing:
 * a preview is genuinely typeable instead of frozen, and the typed value is local to the rendered
 * component rather than pushed back into the model.
 */
export function PrimeInputText({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    return (
        <InputText
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
            readOnly={booleanProperty(element, 'readOnly', false)}
            invalid={booleanProperty(element, 'invalid', false)}
        />
    );
}
