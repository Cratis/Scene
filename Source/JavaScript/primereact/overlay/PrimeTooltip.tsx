// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tooltip } from 'primereact/tooltip';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:tooltip` component - explanatory text shown on hover.
 *
 * The adapter renders the hover target as well as the tooltip, because a tooltip with nothing to point
 * at has nothing to do.
 *
 * PrimeReact 11 replaced the v10 mechanism entirely and this adapter got simpler for it. v10's `Tooltip`
 * attached itself to a CSS selector and read its text from a `data-pr-tooltip` attribute on whatever it
 * found, which forced this adapter to invent a unique attribute selector - and to use an attribute rather
 * than a class, because a Scene element id is free-form and may legally start with a digit, which is not
 * a valid class selector. v11 wraps the target instead: `Tooltip.Trigger` *is* the target, so the
 * selector, the generated attribute and the whole indirection are gone.
 *
 * The trigger is rendered as a `span` rather than v11's default `button`, because the `content` slot may
 * hold any Scene children at all - including a button, which nested inside another button is invalid
 * markup that browsers silently restructure. The cost is that a bare label is not keyboard focusable and
 * so shows on hover only; when a screen puts a real control in the slot, that control brings its own
 * focus behavior.
 */
export function PrimeTooltip({ element, slots }: RegisteredComponentProps) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger as='span' data-scene-id={element.id}>
                {slots.content?.length ? slots.content : stringProperty(element, 'label', 'Hover me')}
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Positioner side={stringProperty(element, 'position', 'top') as 'top' | 'bottom' | 'left' | 'right'}>
                    <Tooltip.Popup>{stringProperty(element, 'text', '')}</Tooltip.Popup>
                </Tooltip.Positioner>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}
