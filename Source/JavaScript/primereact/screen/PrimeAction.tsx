// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:action` component - one of Screenplay's screen directives: something the user can do.
 *
 * A button, but not the same adapter as `button`. Screenplay describes an action by its *intent* - is
 * this the main thing to do here, a secondary one, a destructive one - and that vocabulary is what a
 * screen author writes. Translating intent to PrimeReact's `severity` here keeps the mapping in one
 * place, so a change to how destructive actions look is one edit rather than one per screen.
 */
const severityForIntent: Record<string, 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | undefined> = {
    primary: undefined,
    secondary: 'secondary',
    destructive: 'danger',
    danger: 'danger',
    positive: 'success',
    success: 'success',
};

export function PrimeAction({ element }: RegisteredComponentProps) {
    const intent = stringProperty(element, 'intent', 'primary');
    return (
        <Button
            data-scene-id={element.id}
            label={stringProperty(element, 'label', '')}
            icon={stringProperty(element, 'icon')}
            severity={severityForIntent[intent]}
            outlined={intent === 'secondary'}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
