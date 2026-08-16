// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProgressSpinner } from 'primereact/progressspinner';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';

/**
 * The `PrimeReact:progressSpinner` component - an indeterminate busy indicator.
 *
 * PrimeReact 11 opens the SVG up into parts: `Root` draws the `svg` and its viewBox, `Track` is the
 * circle that stays put and `Range` the arc that turns. Both are needed for the spinner to read as a ring
 * rather than a lone rotating stroke, so the adapter always supplies the pair - a Scene element has no
 * property that would sensibly omit one.
 *
 * `strokeWidth` is a number in v11 where v10 took a string, and it is left at the component's own default
 * because the only thing a screen sizes here is the diameter.
 */
export function PrimeProgressSpinner({ element }: RegisteredComponentProps) {
    const size = numberProperty(element, 'size', 50);
    return (
        <ProgressSpinner.Root data-scene-id={element.id} style={{ width: `${size}px`, height: `${size}px` }}>
            <ProgressSpinner.Track />
            <ProgressSpinner.Range />
        </ProgressSpinner.Root>
    );
}
