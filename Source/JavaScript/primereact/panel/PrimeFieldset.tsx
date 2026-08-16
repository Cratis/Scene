// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fieldset } from 'primereact/fieldset';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:fieldset` component - a container whose legend sits on its border.
 */
export function PrimeFieldset({ element, slots }: RegisteredComponentProps) {
    return (
        <Fieldset data-scene-id={element.id} legend={stringProperty(element, 'legend')} toggleable={booleanProperty(element, 'toggleable', false)}>
            {slots.content}
        </Fieldset>
    );
}
