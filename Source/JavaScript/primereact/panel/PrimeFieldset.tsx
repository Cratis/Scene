// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fieldset } from 'primereact/fieldset';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:fieldset` component - a container whose legend sits on its border.
 *
 * PrimeReact 11 dropped the `toggleable` prop entirely: a compositional `Fieldset` is collapsible exactly
 * when its legend contains a `Fieldset.Trigger`, and inert when it does not. The Scene `toggleable`
 * property therefore selects between two legend shapes rather than setting a flag. Both are rendered as a
 * real `<legend>` either way, so the non-toggleable case does not pay for a button it never uses - which
 * also keeps a static fieldset out of the tab order.
 */
export function PrimeFieldset({ element, slots }: RegisteredComponentProps) {
    const legend = stringProperty(element, 'legend');
    return (
        <Fieldset.Root data-scene-id={element.id} defaultOpen>
            <Fieldset.Legend>
                {booleanProperty(element, 'toggleable', false) ? (
                    <Fieldset.Trigger>
                        <Fieldset.Title>{legend}</Fieldset.Title>
                        <Fieldset.Indicator match='open'>
                            <i className='pi pi-chevron-up' />
                        </Fieldset.Indicator>
                        <Fieldset.Indicator match='closed'>
                            <i className='pi pi-chevron-down' />
                        </Fieldset.Indicator>
                    </Fieldset.Trigger>
                ) : (
                    <Fieldset.Title>{legend}</Fieldset.Title>
                )}
            </Fieldset.Legend>
            <Fieldset.Content>{slots.content}</Fieldset.Content>
        </Fieldset.Root>
    );
}
