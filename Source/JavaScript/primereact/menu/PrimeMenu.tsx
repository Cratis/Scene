// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { Menu } from 'primereact/menu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { MenuItem } from '../MenuItem';
import { menuItemsProperty } from '../menuItems';
import { MenuItemContent } from './MenuItemContent';

/**
 * One selectable entry, as either a command or a link depending on whether the entry names a target.
 *
 * `Menu.Item` renders whatever element `as` names, so the link case is the same part with an anchor
 * underneath rather than a different code path - which is what keeps the menu's own keyboard handling,
 * focus tracking and identifiers working for both kinds of entry.
 *
 * @param item The entry to render.
 * @param value The entry's identity within the menu, which the menu turns into a stable element id.
 * @returns The rendered entry.
 */
function menuEntry(item: MenuItem, value: string): ReactNode {
    return (
        <Menu.Item
            key={value}
            value={value}
            as={item.url === undefined ? 'div' : 'a'}
            href={item.url}
            disabled={item.disabled}
            onSelect={() => item.command?.()}>
            <MenuItemContent item={item} />
        </Menu.Item>
    );
}

/**
 * The `PrimeReact:menu` component - a flat list of commands.
 *
 * PrimeReact 11 turned `Menu` from one component taking a `model` array into a namespace of parts that a
 * caller assembles, so the adapter now walks the item model itself. That is more lines, but it is the only
 * way to reach the parts, and it buys the thing the `model` prop never allowed: an entry can be an anchor
 * when it navigates and a plain item when it commands.
 *
 * `Menu.Root` renders no element of its own unless told which one to be, so `as` is given explicitly -
 * without it the root collapses to a fragment and takes the element's `data-scene-id` and the theme's own
 * scope attributes with it.
 *
 * An entry that carries children is rendered as a labeled group rather than being flattened to its own
 * label, which is what the v10 `Menu` did with a nested entry. Dropping the children instead would lose
 * authored content silently; a menu that genuinely needs a *side-opening* submenu is a `tieredMenu`.
 */
export function PrimeMenu({ element }: RegisteredComponentProps) {
    const items = menuItemsProperty(element, 'items');

    return (
        <Menu.Root as='div' data-scene-id={element.id}>
            <Menu.List>
                {items.map((item, index) => {
                    if (item.separator === true) return <Menu.Separator key={index} />;

                    const children = item.items ?? [];
                    if (children.length === 0) return menuEntry(item, `${index}`);

                    return (
                        <Menu.Group key={index}>
                            <Menu.Label>
                                <MenuItemContent item={item} />
                            </Menu.Label>
                            {children.map((child, childIndex) => menuEntry(child, `${index}-${childIndex}`))}
                        </Menu.Group>
                    );
                })}
            </Menu.List>
        </Menu.Root>
    );
}
