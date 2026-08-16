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
 *
 * In PrimeReact 11 the root is a headless wrapper that renders no element of its own - `Track` is the
 * first real DOM node and the one carrying the ARIA `progressbar` role - so `data-scene-id` and the bar's
 * height belong there rather than on `Root`. `Indicator` renders its children only in determinate mode,
 * which is why the value label can be handed to it unconditionally: an indeterminate bar has no
 * percentage to print and drops it on its own.
 */
export function PrimeProgressBar({ element }: RegisteredComponentProps) {
    const value = numberProperty(element, 'value');
    return (
        <ProgressBar.Root value={value} mode={value === undefined ? 'indeterminate' : 'determinate'}>
            <ProgressBar.Track data-scene-id={element.id} style={{ height: '1rem' }}>
                <ProgressBar.Indicator>{booleanProperty(element, 'showValue', true) && <ProgressBar.Value />}</ProgressBar.Indicator>
            </ProgressBar.Track>
        </ProgressBar.Root>
    );
}
