// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Chips } from 'primereact/chips';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:chips` component - free-form entry of a list of short values, each shown as a chip.
 *
 * In PrimeReact 11 this component is renamed `InputTags`.
 */
export function PrimeChips({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string[]>(stringArrayProperty(element, 'value'));
    return (
        <Chips
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value ?? [])}
            max={undefined}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
