// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { OrderList } from 'primereact/orderlist';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { optionsProperty, stringProperty } from '../properties';
import { SelectOption } from '../SelectOption';

/**
 * The `PrimeReact:orderList` component - a list the user reorders with the supplied controls.
 *
 * Reordering is the component's entire purpose, so the order has to live somewhere that survives a
 * re-render; the adapter keeps it locally, seeded from `items`.
 *
 * In PrimeReact 11 this component becomes a hook rather than a component.
 */
export function PrimeOrderList({ element }: RegisteredComponentProps) {
    const [items, setItems] = useState<SelectOption[]>(optionsProperty(element, 'items'));
    return (
        <OrderList
            data-scene-id={element.id}
            value={items}
            onChange={(event) => setItems(event.value)}
            dataKey='value'
            header={stringProperty(element, 'header')}
            itemTemplate={(item: SelectOption) => <span>{item.label}</span>}
        />
    );
}
