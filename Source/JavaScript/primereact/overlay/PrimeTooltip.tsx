// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tooltip } from 'primereact/tooltip';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:tooltip` component - explanatory text shown on hover.
 *
 * Tooltip attaches itself to a CSS selector rather than wrapping anything, so the adapter renders the
 * hover target too and points the tooltip at it with a `data-` attribute selector. An attribute selector
 * is used rather than a class because a Scene element id is free-form and may legally start with a digit,
 * which is not a valid class selector.
 */
export function PrimeTooltip({ element, slots }: RegisteredComponentProps) {
    const target = `[data-scene-tooltip-target="${element.id}"]`;
    return (
        <>
            <Tooltip target={target} position={stringProperty(element, 'position', 'top') as 'top' | 'bottom' | 'left' | 'right'} />
            <span data-scene-id={element.id} data-scene-tooltip-target={element.id} data-pr-tooltip={stringProperty(element, 'text', '')}>
                {slots.content?.length ? slots.content : stringProperty(element, 'label', 'Hover me')}
            </span>
        </>
    );
}
