// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:contextMenu` component - commands revealed by right-clicking a region.
 *
 * ContextMenu is opened by a caller reacting to a context-menu event, so the adapter renders the region
 * that owns that event as well. Without it the menu could never be opened and the element would render
 * as nothing at all.
 */
export function PrimeContextMenu({ element, slots }: RegisteredComponentProps) {
    const menu = useRef<ContextMenu>(null);
    return (
        <div data-scene-id={element.id} onContextMenu={(event) => menu.current?.show(event)}>
            <ContextMenu ref={menu} model={menuItemsProperty(element, 'items')} />
            {slots.content?.length ? slots.content : <span>{stringProperty(element, 'label', 'Right-click here')}</span>}
        </div>
    );
}
