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
 *
 * PrimeReact 11 renamed the `warning` severity to `warn`, which is why the union below is not the v10
 * one. No intent currently maps to it, but the type has to be right for the one that eventually does.
 */
const severityForIntent: Record<string, 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' | undefined> = {
    primary: undefined,
    secondary: 'secondary',
    destructive: 'danger',
    danger: 'danger',
    positive: 'success',
    success: 'success',
};

/**
 * Renders the action.
 *
 * Two v10 conveniences are gone in PrimeReact 11 and are assembled here instead. `Button` no longer takes
 * `label` and `icon` props - it renders its children - so the icon element and the label text are composed
 * directly. And `outlined` is no longer a boolean; outlining is one of the values of `variant`.
 *
 * The icon is `aria-hidden` because the label already names the action; announcing a decorative glyph
 * beside it would have a screen reader say the same thing twice.
 */
export function PrimeAction({ element }: RegisteredComponentProps) {
    const intent = stringProperty(element, 'intent', 'primary');
    const icon = stringProperty(element, 'icon');
    return (
        <Button
            data-scene-id={element.id}
            severity={severityForIntent[intent]}
            variant={intent === 'secondary' ? 'outlined' : undefined}
            disabled={booleanProperty(element, 'disabled', false)}>
            {icon !== undefined && <i className={icon} aria-hidden='true' />}
            {stringProperty(element, 'label', '')}
        </Button>
    );
}
