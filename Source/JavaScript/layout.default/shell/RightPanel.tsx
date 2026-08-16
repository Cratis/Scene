// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readString } from './elementProperties';

/**
 * The inspector panel down the right-hand edge.
 *
 * Sakai has no right panel; the premium PrimeTek templates all do, and it is where activity feeds, recent
 * items and inline help live. It is exposed as a slot the shell simply does not render when nothing fills
 * it, so a screen pays nothing for a region it does not use.
 */
export function RightPanel({ element, slots }: RegisteredComponentProps) {
    const title = readString(element, 'title');

    return (
        <section data-scene-id={element.id} aria-label={title || 'Panel'}>
            {title && <h2 className='layout-page-header-title'>{title}</h2>}
            {slots.content}
        </section>
    );
}
