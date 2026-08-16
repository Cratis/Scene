// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Divider } from 'primereact/divider';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:divider` component - a rule separating content, optionally with a caption in it.
 */
export function PrimeDivider({ element }: RegisteredComponentProps) {
    const label = stringProperty(element, 'label');
    return (
        <Divider
            data-scene-id={element.id}
            layout={stringProperty(element, 'layout', 'horizontal') as 'horizontal' | 'vertical'}
            align={stringProperty(element, 'align') as 'center' | 'left' | 'right' | 'top' | 'bottom' | undefined}
            type={stringProperty(element, 'type', 'solid') as 'solid' | 'dashed' | 'dotted'}>
            {label}
        </Divider>
    );
}
