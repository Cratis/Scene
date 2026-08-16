// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from 'primereact/panel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:panel` component - a titled container that can optionally collapse.
 *
 * PrimeReact 11 made `Panel` compositional, which moves one decision into the adapter that v10 made
 * internally: the collapse affordance exists only if something renders a `Panel.Trigger`. Rendering one
 * unconditionally would put a chevron on every panel, including the ones a screen declared as fixed, so
 * the trigger is tied to the same `toggleable` property that enables the behavior.
 *
 * The `collapsed` property is expressed as `defaultOpen` rather than a controlled `open`, because a
 * screen states the *initial* state; holding the panel open or shut against the user's clicks is not what
 * `collapsed: true` means.
 */
export function PrimePanel({ element, slots }: RegisteredComponentProps) {
    const toggleable = booleanProperty(element, 'toggleable', false);
    return (
        <Panel.Root data-scene-id={element.id} toggleable={toggleable} defaultOpen={!booleanProperty(element, 'collapsed', false)}>
            <Panel.Header>
                <Panel.Title>{stringProperty(element, 'header')}</Panel.Title>
                {toggleable && (
                    <Panel.Trigger>
                        <Panel.Indicator match='open'>
                            <i className='pi pi-chevron-up' />
                        </Panel.Indicator>
                        <Panel.Indicator match='closed'>
                            <i className='pi pi-chevron-down' />
                        </Panel.Indicator>
                    </Panel.Trigger>
                )}
            </Panel.Header>
            <Panel.Content>{slots.content}</Panel.Content>
        </Panel.Root>
    );
}
