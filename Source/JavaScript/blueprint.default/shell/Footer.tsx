// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readString } from './elementProperties';

/**
 * The strip below the content.
 *
 * Kept as its own slot rather than folded into the content because it is application chrome, not part of
 * a screen: the same footer is on every page, and a screen that had to render it would have to remember
 * to.
 */
export function Footer({ element, slots }: RegisteredComponentProps) {
    const text = readString(element, 'text');

    return (
        <>
            <span data-scene-id={element.id}>{text}</span>
            {slots.content}
        </>
    );
}
