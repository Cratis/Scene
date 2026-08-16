// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:overlayPanel` component - content revealed next to whatever opened it.
 *
 * OverlayPanel positions itself against the event that toggled it, so it is meaningless without a
 * trigger; the adapter renders one and wires `toggle` to it.
 *
 * In PrimeReact 11 this component is renamed `Popover`.
 */
export function PrimeOverlayPanel({ element, slots }: RegisteredComponentProps) {
    const overlay = useRef<OverlayPanel>(null);
    return (
        <div data-scene-id={element.id}>
            <Button label={stringProperty(element, 'triggerLabel', 'Show')} onClick={(event) => overlay.current?.toggle(event)} />
            <OverlayPanel ref={overlay}>{slots.content}</OverlayPanel>
        </div>
    );
}
