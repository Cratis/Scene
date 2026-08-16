// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Divider } from 'primereact/divider';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:divider` component - a rule separating content, optionally with a caption in it.
 *
 * The last component in this family PrimeReact 11 left monolithic, so the port is only a prop rename:
 * v10's `layout` is v11's `orientation`. The Scene property keeps the name `layout`, because a screen's
 * property vocabulary is this package's contract with authored content and renaming it would break every
 * screen that set it to buy nothing.
 */
export function PrimeDivider({ element }: RegisteredComponentProps) {
    const label = stringProperty(element, 'label');
    return (
        <Divider
            data-scene-id={element.id}
            orientation={stringProperty(element, 'layout', 'horizontal') as 'horizontal' | 'vertical'}
            align={stringProperty(element, 'align') as 'center' | 'left' | 'right' | 'top' | 'bottom' | undefined}
            type={stringProperty(element, 'type', 'solid') as 'solid' | 'dashed' | 'dotted'}>
            {label}
        </Divider>
    );
}
