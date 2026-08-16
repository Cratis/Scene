// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { CascadeSelect } from 'primereact/cascadeselect';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, recordArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:cascadeSelect` component - nested groups revealed one level at a time.
 *
 * Options are read as raw records rather than normalized to `SelectOption`, because a cascade is defined
 * by the nesting itself: `optionGroupChildren` names the property each level recurses into, and
 * flattening the records would destroy exactly the structure the component exists to show.
 */
export function PrimeCascadeSelect({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<unknown>(stringProperty(element, 'value'));
    return (
        <CascadeSelect
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value)}
            options={recordArrayProperty(element, 'options')}
            optionLabel={stringProperty(element, 'optionLabel', 'label')}
            optionGroupLabel={stringProperty(element, 'optionGroupLabel', 'label')}
            optionGroupChildren={[stringProperty(element, 'optionGroupChildren', 'items')]}
            placeholder={stringProperty(element, 'placeholder', 'Select')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
