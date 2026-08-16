// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tag } from 'primereact/tag';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:tag` component - a colored status label, the read-only counterpart to a chip.
 */
export function PrimeTag({ element }: RegisteredComponentProps) {
    return (
        <Tag
            data-scene-id={element.id}
            value={stringProperty(element, 'value', '')}
            icon={stringProperty(element, 'icon')}
            severity={stringProperty(element, 'severity') as 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined}
            rounded={booleanProperty(element, 'rounded', false)}
        />
    );
}
