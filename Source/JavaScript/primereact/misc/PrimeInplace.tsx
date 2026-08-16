// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Inplace, InplaceContent, InplaceDisplay } from 'primereact/inplace';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:inplace` component - a read-only value that becomes an editor when clicked.
 *
 * The collapsed view comes from the `label` property and the expanded view from the `content` slot,
 * because the two are different kinds of thing: one is a value, the other is whatever editor the screen
 * wants behind it.
 */
export function PrimeInplace({ element, slots }: RegisteredComponentProps) {
    return (
        <Inplace data-scene-id={element.id} closable={booleanProperty(element, 'closable', true)}>
            <InplaceDisplay>{stringProperty(element, 'label', 'Click to edit')}</InplaceDisplay>
            <InplaceContent>{slots.content}</InplaceContent>
        </Inplace>
    );
}
