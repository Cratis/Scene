// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProgressBar } from 'primereact/progressbar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty } from '../properties';

/**
 * The `PrimeReact:progressBar` component - determinate or indeterminate progress.
 *
 * The mode follows whether a `value` was given at all: progress you cannot measure is exactly what
 * indeterminate mode is for, so an element with no value animates rather than sitting at zero.
 */
export function PrimeProgressBar({ element }: RegisteredComponentProps) {
    const value = numberProperty(element, 'value');
    return (
        <ProgressBar
            data-scene-id={element.id}
            value={value}
            mode={value === undefined ? 'indeterminate' : 'determinate'}
            showValue={booleanProperty(element, 'showValue', true)}
            style={{ height: '1rem' }}
        />
    );
}
