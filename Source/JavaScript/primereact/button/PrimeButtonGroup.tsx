// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ButtonGroup } from 'primereact/buttongroup';
import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { optionsProperty } from '../properties';

/**
 * The `PrimeReact:buttonGroup` component - buttons joined into one visually continuous control.
 *
 * ButtonGroup styles its children by position, so it needs real `Button` elements as children. Slot
 * content is therefore rendered when a screen supplies it, and otherwise the group is built from a
 * `buttons` property - which is what lets a generated screen produce a group without having to nest
 * elements it does not otherwise need.
 *
 * PrimeReact 11 left the group itself alone; the only change is in the buttons, which take their label as
 * children now rather than through a `label` prop.
 */
export function PrimeButtonGroup({ element, slots }: RegisteredComponentProps) {
    const buttons = optionsProperty(element, 'buttons');
    return (
        <ButtonGroup data-scene-id={element.id}>
            {slots.content?.length ? slots.content : buttons.map((button) => <Button key={button.value}>{button.label}</Button>)}
        </ButtonGroup>
    );
}
