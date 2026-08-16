// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { Popover } from 'primereact/popover';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:overlayPanel` component - content revealed next to whatever opened it.
 *
 * A popover positions itself against the thing that opened it, so it is meaningless without a trigger;
 * the adapter renders one.
 *
 * PrimeReact 11 renamed `OverlayPanel` to `Popover` and changed how that trigger is wired. v10 needed a
 * ref and a `toggle(event)` call because it positioned against the *event*; v11 positions against the
 * trigger *element*, which `Popover.Trigger` registers itself. That removes the ref, the click handler
 * and the local visibility state in one go - the composition owns all three - so the trigger here is a
 * real `Button` supplied as `Popover.Trigger`'s `as`, rather than a separate button wired to a ref.
 *
 * The abstract Scene name stays `overlayPanel` so existing screens keep resolving.
 */
export function PrimeOverlayPanel({ element, slots }: RegisteredComponentProps) {
    return (
        <div data-scene-id={element.id}>
            <Popover.Root>
                <Popover.Trigger as={Button}>{stringProperty(element, 'triggerLabel', 'Show')}</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner side='bottom'>
                        <Popover.Popup>
                            <Popover.Content>{slots.content}</Popover.Content>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}
