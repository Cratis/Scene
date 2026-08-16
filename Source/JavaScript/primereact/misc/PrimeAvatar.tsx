// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Avatar } from 'primereact/avatar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:avatar` component - a person or entity shown as initials, an icon or a picture.
 */
export function PrimeAvatar({ element }: RegisteredComponentProps) {
    return (
        <Avatar
            data-scene-id={element.id}
            label={stringProperty(element, 'label')}
            icon={stringProperty(element, 'icon')}
            image={stringProperty(element, 'image')}
            size={stringProperty(element, 'size', 'normal') as 'normal' | 'large' | 'xlarge'}
            shape={stringProperty(element, 'shape', 'square') as 'square' | 'circle'}
        />
    );
}
