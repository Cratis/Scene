// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Badge } from 'primereact/badge';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:badge` component - a small count or status marker.
 */
export function PrimeBadge({ element }: RegisteredComponentProps) {
    return (
        <Badge
            data-scene-id={element.id}
            value={stringProperty(element, 'value', '')}
            severity={stringProperty(element, 'severity') as 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined}
            size={stringProperty(element, 'size') as 'normal' | 'large' | 'xlarge' | undefined}
        />
    );
}
