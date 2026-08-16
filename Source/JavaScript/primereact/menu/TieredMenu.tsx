// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes, useState } from 'react';
import { MenuItem } from '../MenuItem';
import { MenuItemAction } from './MenuItemAction';
import { MenuItemContent } from './MenuItemContent';

const rootStyle: CSSProperties = {
    background: 'var(--scene-surface-card)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
    color: 'var(--scene-text-color)',
    width: 'fit-content',
};

const listStyle: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, minWidth: '12rem' };

const entryStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
    textDecoration: 'none',
    width: '100%',
};

const submenuStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '100%',
    zIndex: 1,
    background: 'var(--scene-surface-overlay)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
};

const separatorStyle: CSSProperties = { borderTop: '1px solid var(--scene-surface-border)', margin: 0 };

/**
 * The configuration {@link TieredMenu} takes.
 */
export interface TieredMenuProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The commands to show. Nesting is followed to any depth - each level opens beside its parent.
     */
    items?: MenuItem[];
}

/**
 * A vertical menu whose submenus open to the side, to any depth. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/tieredmenu` outright, with no successor and no
 * headless hook. The surviving `primereact/menu` parts can nest through `Menu.Submenu`, but only inside a
 * popup anchored to a trigger; a tiered menu is an *inline* control that is already open, which those
 * parts have no shape for. Rebuilding it as plain markup is both smaller and more honest than bending an
 * overlay into standing still.
 *
 * Depth is the one thing this keeps unrestricted, because depth is the whole point of the component: each
 * level renders the same way and holds its own open child, so an authored model nests as far as its
 * author took it.
 *
 * What it deliberately does not carry over from the v10 `TieredMenu`: submenus open on click, never on
 * hover; there is no roving-focus keyboard model with arrow keys walking levels, only the tab order the
 * browser gives; the popup form (`popup` plus an imperative `toggle`) is gone entirely, since Scene only
 * ever rendered the inline one; opening a deep branch does not flip the level to the other side when it
 * would run off the viewport; and item templates are not supported.
 */
export function TieredMenu({ items = [], ...rest }: TieredMenuProps) {
    return (
        <div {...rest} style={rootStyle}>
            <TieredMenuLevel items={items} />
        </div>
    );
}

/**
 * The configuration one level of a tiered menu takes.
 */
interface TieredMenuLevelProps {
    /**
     * The entries at this level.
     */
    items: MenuItem[];
}

/**
 * One level of a tiered menu, holding which of its own entries is currently expanded.
 *
 * Keeping the open entry per level rather than as one path in the root is what makes the recursion
 * trivial: a level knows only about its own children, so it can render another of itself for them without
 * threading an index path down and back.
 */
function TieredMenuLevel({ items }: TieredMenuLevelProps) {
    const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

    return (
        <ul role='menu' style={listStyle}>
            {items.map((item, index) => {
                if (item.separator === true) return <li key={index} role='separator' style={separatorStyle} />;

                const children = item.items ?? [];

                return (
                    <li key={index} role='none' className='relative'>
                        {children.length > 0 ? (
                            <>
                                <button
                                    type='button'
                                    role='menuitem'
                                    className='flex items-center gap-2 p-3'
                                    style={entryStyle}
                                    disabled={item.disabled}
                                    aria-haspopup='true'
                                    aria-expanded={openIndex === index}
                                    onClick={() => setOpenIndex(openIndex === index ? undefined : index)}>
                                    <MenuItemContent item={item} />
                                    <i className='pi pi-angle-right' aria-hidden='true' />
                                </button>
                                {openIndex === index && (
                                    <div style={submenuStyle}>
                                        <TieredMenuLevel items={children} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <MenuItemAction item={item} role='menuitem' className='flex items-center gap-2 p-3' style={entryStyle} />
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
