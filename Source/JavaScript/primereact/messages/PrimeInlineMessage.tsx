// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Message } from 'primereact/message';
import { RegisteredComponentProps } from '@cratis/scene.react';
import {severityProperty, stringProperty} from '../properties';

/**
 * The `primeicons` class that stands for each severity.
 *
 * Deliberately duplicated from `PrimeMessage` rather than shared. Both adapters need it and neither needs
 * the other, and lifting six lines into a module would put a helper nobody outside this folder wants into
 * the package's public surface - `index.ts` re-exports everything a file exports.
 *
 * The icon is kept even for the compact variant, because severity is otherwise carried by color alone,
 * and "the red one means you have to fix it" is not information a reader who cannot see the color gets.
 */
const severityIcons: Record<string, string> = {
    success: 'pi pi-check-circle',
    info: 'pi pi-info-circle',
    warn: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
};

/**
 * The `PrimeReact:inlineMessage` component - a short notice sitting beside the field it is about.
 *
 * The same PrimeReact `Message` as `message`, sized to its content instead of the row, so a validation
 * hint reads as belonging to one field rather than to the whole form. PrimeReact 11 gives that intent a
 * name of its own - `variant='simple'` drops the panel and leaves the icon and the words - which is
 * exactly what the v10 adapter was approximating with a width class, so the distinction survives the
 * migration and lands on a real prop rather than on CSS.
 *
 * The v11 module is `primereact/message`, singular. The plural `messages` module - a list of notices
 * driven imperatively - was removed with no replacement, but this package never declared a name for it,
 * so nothing here is lost with it.
 */
export function PrimeInlineMessage({ element }: RegisteredComponentProps) {
    const severity = severityProperty(element, 'severity', 'info');
    return (
        <Message.Root
            data-scene-id={element.id}
            className='inline-flex'
            variant='simple'
            severity={severity as 'success' | 'info' | 'warn' | 'error'}>
            <Message.Icon>
                <i className={severityIcons[severity] ?? severityIcons.info} aria-hidden='true' />
            </Message.Icon>
            <Message.Content>
                <Message.Text>{stringProperty(element, 'text', '')}</Message.Text>
            </Message.Content>
        </Message.Root>
    );
}
