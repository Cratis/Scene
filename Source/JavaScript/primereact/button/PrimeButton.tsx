// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import {booleanProperty, stringProperty} from '../properties';
import { readButtonLook } from './readButtonLook';

/**
 * The `PrimeReact:button` component.
 *
 * Deliberately claims the same bare name `core` already declares. A `ui profile` listing `core` and then
 * `PrimeReact` resolves `button` to this one and records that it shadowed core's - which is the whole
 * point of override priority, and the reason a screen written against the fallback vocabulary gets a real
 * themed button the moment a component library is added to the profile, with no edit to the screen.
 *
 * PrimeReact 11 reshaped the props under it, and the adapter absorbs all of it so screens do not have to.
 * `label` and `icon` are children now rather than props. The `outlined` and `text` booleans collapsed into
 * a single `variant`, which is the better model - they were never combinable - and the authored booleans
 * are still read and translated. `warning` became `warn`.
 *
 * The look is `readButtonLook`'s: the `severity` property takes a severity or a form, so every variant a design system declares for the
 * Button reaches PrimeReact as its own `severity` and `variant` props, and the design system's `--ds-button-<variant>-<part>` values
 * paint it (see `primeReactTheme.css`).
 *
 * `loading` is the one that could not simply be translated: v11 dropped it. The state still matters to a
 * screen, so it is rebuilt from parts that exist - a spinning icon in place of the button's own, the
 * button disabled so the action cannot be fired twice, and `aria-busy` so the state is announced rather
 * than only drawn. The icon is marked decorative throughout because the label already names the action.
 */
export function PrimeButton({ element, slots, interactions }: RegisteredComponentProps) {
    const icon = stringProperty(element, 'icon');
    const { severity, variant } = readButtonLook(element);
    const loading = booleanProperty(element, 'loading', false);

    return (
        <Button
            data-scene-id={element.id}
            {...interactions}
            severity={severity}
            variant={variant}
            rounded={booleanProperty(element, 'rounded', false)}
            disabled={loading || booleanProperty(element, 'disabled', false)}
            aria-busy={loading}>
            {loading && <i className='pi pi-spinner pi-spin' aria-hidden='true' />}
            {!loading && icon !== undefined && <i className={icon} aria-hidden='true' />}
            {stringProperty(element, 'label')}
            {slots.content}
        </Button>
    );
}
