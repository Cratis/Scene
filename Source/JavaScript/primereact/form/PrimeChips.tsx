// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputTags } from 'primereact/inputtags';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:chips` component - free-form entry of a list of short values, each shown as a chip.
 * PrimeReact 11 calls it `InputTags`.
 *
 * The chips and the text field are both render-prop slots in v11 rather than markup the component
 * chooses, which is why this file draws a chip and its remove button by hand: `Items` hands over one tag
 * at a time along with the props that make it removable, and `Control` hands over the props for the
 * input. It is more code than the v10 one-liner and it is the reason the chip is stylable at all.
 *
 * A tag is committed per Enter, and pasted text arrives as one tag rather than being split. That is v11's
 * default and the adapter keeps it: v10's `separator` property is not read, because splitting on a
 * character is a data-entry policy that belongs to the screen collecting the data, not to a preview of it.
 */
export function PrimeChips({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<string[]>(stringArrayProperty(element, 'value'));
    return (
        <InputTags.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value ?? [])}
            max={numberProperty(element, 'max')}
            disabled={booleanProperty(element, 'disabled', false)}>
            <InputTags.Items>
                {({ item, index, remove, itemProps }) => (
                    <span {...itemProps} key={`${item}-${index}`}>
                        <span>{item}</span>
                        <button type='button' aria-label={`Remove ${item}`} onClick={remove}>
                            <i className='pi pi-times-circle' />
                        </button>
                    </span>
                )}
            </InputTags.Items>
            <InputTags.Control>
                {({ controlProps }) => <input {...controlProps} placeholder={stringProperty(element, 'placeholder')} />}
            </InputTags.Control>
        </InputTags.Root>
    );
}
