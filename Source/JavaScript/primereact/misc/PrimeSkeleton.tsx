// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Skeleton } from 'primereact/skeleton';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:skeleton` component - the shape of content that has not arrived yet.
 *
 * One of the few components PrimeReact 11 left whole, and the props survived with it. The defaults are
 * repeated here rather than left to the component because a skeleton is only ever authored for a specific
 * gap in a layout, and a full-width one-line bar is the gap a screen most often has.
 */
export function PrimeSkeleton({ element }: RegisteredComponentProps) {
    return (
        <Skeleton
            data-scene-id={element.id}
            shape={stringProperty(element, 'shape', 'rectangle') as 'rectangle' | 'circle'}
            width={stringProperty(element, 'width', '100%')}
            height={stringProperty(element, 'height', '1rem')}
        />
    );
}
