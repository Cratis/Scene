// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProgressSpinner } from 'primereact/progressspinner';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:progressSpinner` component - an indeterminate busy indicator.
 */
export function PrimeProgressSpinner({ element }: RegisteredComponentProps) {
    const size = numberProperty(element, 'size', 50);
    return <ProgressSpinner data-scene-id={element.id} strokeWidth='4' style={{ width: `${size}px`, height: `${size}px` }} />;
}
