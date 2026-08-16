// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Message } from 'primereact/message';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `primeicons` class that stands for each severity.
 *
 * PrimeReact 10 chose this icon for you; PrimeReact 11 made the icon a part you compose, which is right
 * for an application - it can use its own icon set - and wrong for a Scene element, which has no way to
 * name one. The mapping is restored here so a notice still reads at a glance rather than as an
 * undifferentiated colored box.
 */
const severityIcons: Record<string, string> = {
    success: 'pi pi-check-circle',
    info: 'pi pi-info-circle',
    warn: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
};

/**
 * The `PrimeReact:message` component - a block-level notice attached to a region of a screen.
 *
 * Rendered full width, which is what separates it from `inlineMessage`: the two share PrimeReact's
 * `Message` component but mean different things on a screen, and the width is the difference a reader
 * actually sees. PrimeReact 11 adds a second axis for the same distinction - `variant` - and this one is
 * the default, bordered variant, because a region-level notice is meant to be a block you notice.
 *
 * The v11 module is `primereact/message`, singular, which is the one that survived; the plural `messages`
 * module - a list of notices with its own imperative API - was removed outright, and this package never
 * declared a name for it.
 *
 * v10's `warning` is translated to v11's `warn` so screens written against the old vocabulary keep their
 * color; `error` was and still is spelled the same here, unlike everywhere else in PrimeReact where the
 * danger severity is called `danger`.
 */
export function PrimeMessage({ element }: RegisteredComponentProps) {
    const authored = stringProperty(element, 'severity', 'info');
    const severity = authored === 'warning' ? 'warn' : authored;
    return (
        <Message.Root data-scene-id={element.id} className='w-full' severity={severity as 'success' | 'info' | 'warn' | 'error'}>
            <Message.Icon>
                <i className={severityIcons[severity] ?? severityIcons.info} aria-hidden='true' />
            </Message.Icon>
            <Message.Content>
                <Message.Text>{stringProperty(element, 'text', '')}</Message.Text>
            </Message.Content>
        </Message.Root>
    );
}
