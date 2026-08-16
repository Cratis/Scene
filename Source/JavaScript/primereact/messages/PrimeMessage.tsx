// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Message } from 'primereact/message';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:message` component - a block-level notice attached to a region of a screen.
 *
 * Rendered full width, which is what separates it from `inlineMessage`: the two share PrimeReact's
 * `Message` component but mean different things on a screen, and the width is the difference a reader
 * actually sees.
 */
export function PrimeMessage({ element }: RegisteredComponentProps) {
    return (
        <Message
            data-scene-id={element.id}
            className='w-full'
            severity={stringProperty(element, 'severity', 'info') as 'success' | 'info' | 'warn' | 'error'}
            text={stringProperty(element, 'text', '')}
        />
    );
}
