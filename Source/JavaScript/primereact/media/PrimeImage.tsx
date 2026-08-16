// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Image } from 'primereact/image';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:image` component - an image with an optional full-screen preview.
 *
 * `alt` defaults to an empty string rather than to the file name: an image with no authored alternative
 * text is decorative until someone says otherwise, and inventing one would put a URL fragment in front of
 * a screen reader.
 */
export function PrimeImage({ element }: RegisteredComponentProps) {
    return (
        <Image
            data-scene-id={element.id}
            src={stringProperty(element, 'src', '')}
            alt={stringProperty(element, 'alt', '')}
            width={stringProperty(element, 'width')}
            height={stringProperty(element, 'height')}
            preview={booleanProperty(element, 'preview', false)}
        />
    );
}
