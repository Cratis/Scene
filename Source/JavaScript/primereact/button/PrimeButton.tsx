// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:button` component.
 *
 * Deliberately claims the same bare name `core` already declares. A `ui profile` listing `core` and then
 * `PrimeReact` resolves `button` to this one and records that it shadowed core's - which is the whole
 * point of override priority, and the reason a screen written against the fallback vocabulary gets a real
 * themed button the moment a component library is added to the profile, with no edit to the screen.
 */
export function PrimeButton({ element, slots }: RegisteredComponentProps) {
    return (
        <Button
            data-scene-id={element.id}
            label={stringProperty(element, 'label')}
            icon={stringProperty(element, 'icon')}
            severity={stringProperty(element, 'severity') as 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | undefined}
            outlined={booleanProperty(element, 'outlined', false)}
            text={booleanProperty(element, 'text', false)}
            rounded={booleanProperty(element, 'rounded', false)}
            loading={booleanProperty(element, 'loading', false)}
            disabled={booleanProperty(element, 'disabled', false)}>
            {slots.content}
        </Button>
    );
}
