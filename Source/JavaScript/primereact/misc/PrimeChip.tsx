// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Chip } from 'primereact/chip';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:chip` component - a compact, optionally removable label.
 */
export function PrimeChip({ element }: RegisteredComponentProps) {
    return (
        <Chip
            data-scene-id={element.id}
            label={stringProperty(element, 'label')}
            icon={stringProperty(element, 'icon')}
            image={stringProperty(element, 'image')}
            removable={booleanProperty(element, 'removable', false)}
        />
    );
}
