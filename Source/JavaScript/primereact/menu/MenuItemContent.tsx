// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MenuItem } from '../MenuItem';

/**
 * The configuration {@link MenuItemContent} takes.
 */
export interface MenuItemContentProps {
    /**
     * The entry whose icon and label to show.
     */
    item: MenuItem;
}

/**
 * The inside of one menu entry - its icon and its label - without the element that makes it selectable.
 *
 * Seven of the components in this folder are Cratis-owned replacements for menus PrimeReact 11 removed,
 * and each of them wraps an entry in a different element: a menubar puts it in a button, a tiered menu in
 * a list row, a dock in an icon-only control. What never differs is the inside, so it is written once
 * here instead of seven times, where six copies would eventually drift apart.
 *
 * Sharing it also settles one accessibility decision in a single place rather than repeatedly: the label
 * already carries the meaning, so the icon beside it is decoration and is hidden from assistive
 * technology. Left to each component, that is exactly the kind of detail one of them would quietly get
 * wrong.
 */
export function MenuItemContent({ item }: MenuItemContentProps) {
    return (
        <>
            {item.icon !== undefined && <i className={item.icon} aria-hidden='true' />}
            {item.label !== undefined && <span>{item.label}</span>}
        </>
    );
}
