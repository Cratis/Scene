// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { TreeSelect } from 'primereact/treeselect';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';
import { treeNodesProperty } from '../treeNodes';

/**
 * The `PrimeReact:treeSelect` component - a dropdown whose choices are a hierarchy.
 */
export function PrimeTreeSelect({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string | undefined>(stringProperty(element, 'value'));
    return (
        <TreeSelect
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(typeof event.value === 'string' ? event.value : undefined)}
            options={treeNodesProperty(element, 'options')}
            placeholder={stringProperty(element, 'placeholder', 'Select')}
            filter={booleanProperty(element, 'filter', false)}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
