// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { PickList } from 'primereact/picklist';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { optionsProperty, stringProperty } from '../properties';
import { SelectOption } from '../SelectOption';

/**
 * The `PrimeReact:pickList` component - two lists with items moved between them.
 *
 * Both sides are held locally for the same reason {@link PrimeOrderList} holds its order: moving items is
 * what the component does, and a Scene element cannot record the result.
 *
 * In PrimeReact 11 this component becomes a hook rather than a component.
 */
export function PrimePickList({ element }: RegisteredComponentProps) {
    const [source, setSource] = useState<SelectOption[]>(optionsProperty(element, 'source'));
    const [target, setTarget] = useState<SelectOption[]>(optionsProperty(element, 'target'));
    return (
        <PickList
            data-scene-id={element.id}
            source={source}
            target={target}
            onChange={(event) => {
                setSource(event.source);
                setTarget(event.target);
            }}
            dataKey='value'
            sourceHeader={stringProperty(element, 'sourceHeader', 'Available')}
            targetHeader={stringProperty(element, 'targetHeader', 'Selected')}
            itemTemplate={(item: SelectOption) => <span>{item.label}</span>}
        />
    );
}
