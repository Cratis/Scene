// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContextMenu } from 'primereact/contextmenu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';
import { MenuItemContent } from './MenuItemContent';

/**
 * The `PrimeReact:contextMenu` component - commands revealed by right-clicking a region.
 *
 * The adapter renders the region that owns the context-menu event as well as the menu itself. Without it
 * the menu could never be opened and the element would render as nothing at all.
 *
 * What changed in PrimeReact 11 is who owns that event. In v10 the menu was one component and the caller
 * had to hold a ref to it and call `show(event)` from its own `onContextMenu` handler. In v11
 * `ContextMenu.Trigger` is a part that already carries the handler, the `aria-haspopup` and the expanded
 * state, so the ref and the hand-written handler are both gone - the region is now declared as the
 * trigger rather than wired to the menu after the fact.
 *
 * The overlay is spelled out as portal, positioner and popup because those are separate parts now. That is
 * not ceremony: the positioner is what keeps the menu on screen near the pointer, and it renders nothing
 * at all until the menu is actually open, which is what makes an unopened context menu cost nothing.
 */
export function PrimeContextMenu({ element, slots }: RegisteredComponentProps) {
    const items = menuItemsProperty(element, 'items');

    return (
        <ContextMenu.Root data-scene-id={element.id}>
            <ContextMenu.Trigger>
                {slots.content?.length ? slots.content : <span>{stringProperty(element, 'label', 'Right-click here')}</span>}
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Positioner>
                    <ContextMenu.Popup>
                        <ContextMenu.List>
                            {items.map((item, index) =>
                                item.separator === true ? (
                                    <ContextMenu.Separator key={index} />
                                ) : (
                                    <ContextMenu.Item
                                        key={index}
                                        value={`${index}`}
                                        as={item.url === undefined ? 'div' : 'a'}
                                        href={item.url}
                                        disabled={item.disabled}
                                        onSelect={() => item.command?.()}>
                                        <MenuItemContent item={item} />
                                    </ContextMenu.Item>
                                )
                            )}
                        </ContextMenu.List>
                    </ContextMenu.Popup>
                </ContextMenu.Positioner>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}
