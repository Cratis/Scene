// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Inplace } from 'primereact/inplace';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inplace` component - a read-only value that becomes an editor when clicked.
 *
 * The collapsed view comes from the `label` property and the expanded view from the `content` slot,
 * because the two are different kinds of thing: one is a value, the other is whatever editor the screen
 * wants behind it.
 *
 * PrimeReact 11 turned the `closable` flag into a `Close` part, which is a better arrangement than it
 * looks: the button now lives *inside* the editor, so it is reached by the same tab order as the editor
 * itself instead of floating beside a region the reader has already left. The property is kept and simply
 * decides whether that part is rendered, so screens written against v10 keep meaning what they said.
 */
export function PrimeInplace({ element, slots }: RegisteredComponentProps) {
    return (
        <Inplace.Root data-scene-id={element.id}>
            <Inplace.Display>{stringProperty(element, 'label', 'Click to edit')}</Inplace.Display>
            <Inplace.Content>
                {slots.content}
                {booleanProperty(element, 'closable', true) && (
                    <Inplace.Close aria-label='Close editor'>
                        <i className='pi pi-times' aria-hidden='true' />
                    </Inplace.Close>
                )}
            </Inplace.Content>
        </Inplace.Root>
    );
}
