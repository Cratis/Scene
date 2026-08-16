// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Avatar } from 'primereact/avatar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:avatar` component - a person or entity shown as initials, an icon or a picture.
 *
 * PrimeReact 11 turned Avatar into a composition, and the split is the interesting part: `Avatar.Image`
 * renders only once the browser has actually loaded the source, and `Avatar.Fallback` renders only while
 * it has not. That is exactly the behavior a screen wants and could not previously express - a picture
 * that 404s now degrades to the initials instead of leaving a broken image icon in a list of faces.
 *
 * The image part is left out entirely when no `image` was authored, rather than mounted with an empty
 * source: it would spend an effect on a load that can never happen, and the fallback is what shows either
 * way.
 */
export function PrimeAvatar({ element }: RegisteredComponentProps) {
    const label = stringProperty(element, 'label');
    const icon = stringProperty(element, 'icon');
    const image = stringProperty(element, 'image');
    return (
        <Avatar.Root
            data-scene-id={element.id}
            size={stringProperty(element, 'size', 'normal') as 'normal' | 'large' | 'xlarge'}
            shape={stringProperty(element, 'shape', 'square') as 'square' | 'circle'}>
            {image !== undefined && <Avatar.Image src={image} alt={label ?? ''} />}
            <Avatar.Fallback>{icon !== undefined ? <i className={icon} aria-hidden='true' /> : label}</Avatar.Fallback>
        </Avatar.Root>
    );
}
