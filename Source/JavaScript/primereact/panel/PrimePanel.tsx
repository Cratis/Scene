// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from 'primereact/panel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:panel` component - a titled container that can optionally collapse.
 */
export function PrimePanel({ element, slots }: RegisteredComponentProps) {
    return (
        <Panel
            data-scene-id={element.id}
            header={stringProperty(element, 'header')}
            toggleable={booleanProperty(element, 'toggleable', false)}
            collapsed={booleanProperty(element, 'collapsed', false)}>
            {slots.content}
        </Panel>
    );
}
