// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { type UsePickListProps, usePickList } from '@primereact/headless/picklist';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { optionsProperty, stringProperty } from '../properties';
import { SelectOption } from '../SelectOption';
import { toSelectOptions } from './selectOptions';

/**
 * The `PrimeReact:pickList` component - two lists with items moved between them.
 *
 * Like {@link PrimeOrderList}, this is built on a headless hook because PrimeReact 11 ships no styled
 * pick list: `usePickList` decides what a move does to each side and which move buttons are live, and the
 * markup below is this package's own.
 *
 * Both sides are held locally for the same reason the order list holds its order - moving items is what
 * the component does, and a Scene element cannot record the result. Selection is held locally too, but
 * for a different reason: the hook reads it and only ever *prunes* it, when a selected item leaves the
 * side it was on, so something has to add to it when the user picks a row.
 */
export function PrimePickList({ element }: RegisteredComponentProps) {
    const [source, setSource] = useState<SelectOption[]>(() => optionsProperty(element, 'source'));
    const [target, setTarget] = useState<SelectOption[]>(() => optionsProperty(element, 'target'));
    const [selection, setSelection] = useState<SelectOption[]>([]);
    const pickListProps: UsePickListProps<SelectOption> = {
        source,
        target,
        selection,
        onValueChange: (event) => {
            setSource(toSelectOptions(event.source));
            setTarget(toSelectOptions(event.target));
        },
        onSelectionChange: (event) => setSelection(toSelectOptions(event.value)),
    };
    const pickList = usePickList(pickListProps);

    const toggle = (item: SelectOption) =>
        setSelection((current) => (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]));

    const list = (heading: string, items: SelectOption[], side: 'source' | 'target', listProps: Record<string, unknown>) => (
        <div className='flex flex-col gap-1'>
            <span className='font-semibold'>{heading}</span>
            <ul className='flex flex-col border' role='listbox' aria-label={heading} aria-multiselectable {...listProps}>
                {items.map((item, index) => (
                    <li
                        key={item.value}
                        role='option'
                        aria-selected={selection.includes(item)}
                        className='cursor-pointer px-3 py-1'
                        onClick={() => toggle(item)}
                        {...pickList.getOptionProps(item, index, side)}>
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div data-scene-id={element.id} className='flex gap-2' {...pickList.rootProps}>
            {list(stringProperty(element, 'sourceHeader', 'Available'), source, 'source', pickList.sourceListProps)}
            <div className='flex flex-col gap-1 self-center'>
                <button {...pickList.moveToTargetProps}>›</button>
                <button {...pickList.moveAllToTargetProps}>»</button>
                <button {...pickList.moveToSourceProps}>‹</button>
                <button {...pickList.moveAllToSourceProps}>«</button>
            </div>
            {list(stringProperty(element, 'targetHeader', 'Selected'), target, 'target', pickList.targetListProps)}
        </div>
    );
}
