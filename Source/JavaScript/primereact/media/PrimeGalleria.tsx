// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Gallery } from 'primereact/gallery';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, recordArrayProperty } from '../properties';

/**
 * The `PrimeReact:galleria` component - a gallery with thumbnails and a large view.
 *
 * PrimeReact 11 renamed the module to `gallery` and turned it into a composition, which removes the
 * awkwardness the v10 adapter had to work around: there are no `item` and `thumbnail` render-prop
 * templates to supply, only two lists the adapter writes out itself. Each entry is still read as
 * `{ src, thumbnail, alt }`, with the thumbnail falling back to the full image - the common case for a
 * small gallery that has no separately generated thumbnails.
 *
 * The abstract name stays `galleria`. Renaming it would be renaming Scene's vocabulary because PrimeReact
 * renamed a module, and every screen that says `galleria` today would have to be edited to say the same
 * thing.
 *
 * Navigation and the thumbnail rail are rendered only when there is something to navigate: a single image
 * needs no previous and next, and no items at all leave a bare, empty gallery rather than a frame of
 * chrome around nothing.
 */
export function PrimeGalleria({ element }: RegisteredComponentProps) {
    const items = recordArrayProperty(element, 'items');
    const showThumbnails = booleanProperty(element, 'showThumbnails', true);
    return (
        <Gallery.Root data-scene-id={element.id} style={{ maxWidth: `${numberProperty(element, 'maxWidth', 480)}px` }}>
            <Gallery.Content>
                {items.map((item, index) => (
                    <Gallery.Item key={index}>
                        <img src={String(item.src ?? '')} alt={String(item.alt ?? '')} className='block w-full' />
                    </Gallery.Item>
                ))}
                {items.length > 1 && (
                    <>
                        <Gallery.Prev aria-label='Previous image'>
                            <i className='pi pi-chevron-left' aria-hidden='true' />
                        </Gallery.Prev>
                        <Gallery.Next aria-label='Next image'>
                            <i className='pi pi-chevron-right' aria-hidden='true' />
                        </Gallery.Next>
                    </>
                )}
            </Gallery.Content>
            {showThumbnails && items.length > 1 && (
                <Gallery.Thumbnail slidesPerPage={numberProperty(element, 'numVisible', 5)} loop={booleanProperty(element, 'circular', true)}>
                    <Gallery.ThumbnailContent>
                        {items.map((item, index) => (
                            <Gallery.ThumbnailItem key={index} index={index}>
                                <img src={String(item.thumbnail ?? item.src ?? '')} alt={String(item.alt ?? '')} className='block h-12' />
                            </Gallery.ThumbnailItem>
                        ))}
                    </Gallery.ThumbnailContent>
                </Gallery.Thumbnail>
            )}
        </Gallery.Root>
    );
}
