// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { AriaRole, CSSProperties } from 'react';
import { MenuItem } from '../MenuItem';
import { MenuItemContent } from './MenuItemContent';

/**
 * The configuration {@link MenuItemAction} takes.
 */
export interface MenuItemActionProps {
    /**
     * The entry to make selectable.
     */
    item: MenuItem;

    /**
     * The ARIA role the entry plays inside its container - `menuitem` inside a menu, left unset inside a
     * plain navigation bar where the surrounding markup already says what the entry is.
     */
    role?: AriaRole;

    /**
     * Whether this entry is the one the user is currently on, which is announced as `aria-current`.
     */
    current?: boolean;

    /**
     * Classes for the entry, so each menu can keep its own layout while sharing this behavior.
     */
    className?: string;

    /**
     * Inline styling for the entry. This package ships no component stylesheets - a `.css` import would
     * not survive the `tsc` build - so chrome that cannot be expressed with the shared utility classes is
     * written here.
     */
    style?: CSSProperties;

    /**
     * Invoked after the entry's own `command`, so a menu can close itself or record a selection.
     */
    onActivate?: () => void;
}

/**
 * One selectable menu entry, rendered as a link when it navigates and as a button when it commands.
 *
 * The distinction is not cosmetic and it is the reason this is shared rather than repeated. An entry
 * carrying a `url` is navigation: it belongs in an anchor so it can be opened in a new tab, copied,
 * followed by a screen reader's link list and reached the way every other link on the page is. An entry
 * carrying a `command` changes something on the current screen, which is what a button is for. Getting
 * that wrong is invisible to a sighted mouse user and immediately wrong for everyone else, so the five
 * Cratis-owned menus that need a selectable entry all defer the choice to here.
 *
 * A disabled entry is always a button, even when it has a `url`, because there is no way to disable an
 * anchor - `aria-disabled` still leaves it clickable and focusable. Rendering the button lets the
 * platform's own disabled semantics do the work.
 */
export function MenuItemAction({ item, role, current, className, style, onActivate }: MenuItemActionProps) {
    const activate = () => {
        item.command?.();
        onActivate?.();
    };

    if (item.url !== undefined && item.disabled !== true) {
        return (
            <a
                href={item.url}
                role={role}
                className={className}
                style={style}
                aria-current={current === true ? 'page' : undefined}
                onClick={activate}>
                <MenuItemContent item={item} />
            </a>
        );
    }

    return (
        <button
            type='button'
            role={role}
            className={className}
            style={style}
            disabled={item.disabled}
            aria-current={current === true ? 'page' : undefined}
            onClick={activate}>
            <MenuItemContent item={item} />
        </button>
    );
}
