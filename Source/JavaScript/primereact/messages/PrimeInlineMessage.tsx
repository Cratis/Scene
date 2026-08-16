// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Message } from 'primereact/message';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:inlineMessage` component - a short notice sitting beside the field it is about.
 *
 * The same PrimeReact `Message` as `message`, sized to its content instead of the row, so a validation
 * hint reads as belonging to one field rather than to the whole form.
 */
export function PrimeInlineMessage({ element }: RegisteredComponentProps) {
    return (
        <Message
            data-scene-id={element.id}
            className='inline-flex'
            severity={stringProperty(element, 'severity', 'info') as 'success' | 'info' | 'warn' | 'error'}
            text={stringProperty(element, 'text', '')}
        />
    );
}
