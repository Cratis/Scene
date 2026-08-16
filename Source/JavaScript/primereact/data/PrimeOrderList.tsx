// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { type UseOrderListProps, useOrderList } from '@primereact/headless/orderlist';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { optionsProperty, stringProperty } from '../properties';
import { SelectOption } from '../SelectOption';
import { toSelectOptions } from './selectOptions';

/**
 * The `PrimeReact:orderList` component - a list the user reorders with the supplied controls.
 *
 * PrimeReact 11 ships no styled order list at all: what survives is `useOrderList`, a headless hook that
 * owns the ordering, works out which moves are legal, and hands back ready-made props for the move
 * buttons - but renders nothing. The presentation below is therefore this package's, not PrimeReact's,
 * which is why it is written out in full rather than configured.
 *
 * Selection is the one piece the hook does not own. It reads `selection` and never writes it, and it
 * compares entries by identity, so the adapter holds the selected options and the very same object
 * references it passed in as the list. Reordering is the component's entire purpose, so the order has to
 * survive a re-render too; it is seeded from `items` once and kept from there on.
 */
export function PrimeOrderList({ element }: RegisteredComponentProps) {
    const [items, setItems] = useState<SelectOption[]>(() => optionsProperty(element, 'items'));
    const [selection, setSelection] = useState<SelectOption[]>([]);
    const orderListProps: UseOrderListProps<SelectOption> = {
        value: items,
        selection,
        onValueChange: (event) => setItems(toSelectOptions(event.value)),
    };
    const orderList = useOrderList(orderListProps);
    const header = stringProperty(element, 'header');

    const toggle = (item: SelectOption) =>
        setSelection((current) => (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]));

    return (
        <div data-scene-id={element.id} className='flex gap-2' {...orderList.rootProps}>
            <div className='flex flex-col gap-1' {...orderList.controlsProps}>
                <button {...orderList.firstProps}>⤒</button>
                <button {...orderList.prevProps}>↑</button>
                <button {...orderList.nextProps}>↓</button>
                <button {...orderList.lastProps}>⤓</button>
            </div>
            <div className='flex flex-col gap-1'>
                {header !== undefined && <span className='font-semibold'>{header}</span>}
                <ul
                    className='flex flex-col border'
                    role='listbox'
                    aria-multiselectable
                    ref={(node) => {
                        orderList.listRef.current = node;
                    }}
                    {...orderList.listProps}>
                    {items.map((item, index) => (
                        <li
                            key={item.value}
                            role='option'
                            aria-selected={selection.includes(item)}
                            className='cursor-pointer px-3 py-1'
                            onClick={() => toggle(item)}
                            {...orderList.getOptionProps(item, index)}>
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
