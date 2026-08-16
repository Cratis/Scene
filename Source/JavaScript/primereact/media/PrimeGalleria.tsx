// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Galleria } from 'primereact/galleria';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, recordArrayProperty } from '../properties';

/**
 * The `PrimeReact:galleria` component - a gallery with thumbnails and a large view.
 *
 * Galleria ships no default templates, so the adapter supplies both; each item is read as
 * `{ src, thumbnail, alt }` with the thumbnail falling back to the full image, which is the common case
 * for a small gallery that has no separately generated thumbnails.
 *
 * In PrimeReact 11 this component is renamed `Gallery`.
 */
export function PrimeGalleria({ element }: RegisteredComponentProps) {
    const items = recordArrayProperty(element, 'items');
    return (
        <Galleria
            data-scene-id={element.id}
            value={items}
            numVisible={numberProperty(element, 'numVisible', 5)}
            circular={booleanProperty(element, 'circular', true)}
            showThumbnails={booleanProperty(element, 'showThumbnails', true)}
            style={{ maxWidth: `${numberProperty(element, 'maxWidth', 480)}px` }}
            item={(item: Record<string, unknown>) => (
                <img src={String(item.src ?? '')} alt={String(item.alt ?? '')} className='block w-full' />
            )}
            thumbnail={(item: Record<string, unknown>) => (
                <img src={String(item.thumbnail ?? item.src ?? '')} alt={String(item.alt ?? '')} className='block h-12' />
            )}
        />
    );
}
