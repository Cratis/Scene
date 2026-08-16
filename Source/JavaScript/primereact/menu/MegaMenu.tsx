// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes, useEffect, useState } from 'react';
import { MenuItem } from '../MenuItem';
import { MenuItemAction } from './MenuItemAction';
import { MenuItemContent } from './MenuItemContent';

const barStyle: CSSProperties = {
    background: 'var(--scene-surface-card)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
    color: 'var(--scene-text-color)',
};

const triggerStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    textDecoration: 'none',
};

const panelStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1,
    background: 'var(--scene-surface-overlay)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
};

const columnHeadingStyle: CSSProperties = { color: 'var(--scene-text-muted-color)' };

const columnItemStyle: CSSProperties = { ...triggerStyle, width: '100%', textAlign: 'left' };

/**
 * The configuration {@link MegaMenu} takes.
 */
export interface MegaMenuProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The commands to show. Each top-level entry's children are the columns of its panel, and each
     * column's own children are the commands in that column.
     */
    items?: MenuItem[];
}

/**
 * A horizontal bar whose panels lay their commands out in labeled columns. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/megamenu` outright, with no successor and no
 * headless hook, so a screen that authored a mega menu had nothing left to render. It is a separate
 * component from {@link Menubar} rather than a flag on it because the two read genuinely different item
 * models - a menubar's children are commands, a mega menu's children are columns - and collapsing that
 * into a boolean would make both harder to read than keeping them apart.
 *
 * The column model is where this deliberately departs from v10. PrimeReact 10 spelled columns as an array
 * of arrays, so an entry's `items` held column groups rather than menu entries. Scene's item reader
 * follows nested *objects* and drops nested arrays, which means that shape never reached the component
 * intact anyway. Columns are therefore one ordinary level of nesting here: an entry's children are
 * columns, and a column's children are its commands. The same authored model now survives the reader.
 *
 * What it otherwise does not carry over from v10: there is no vertical orientation, so the `orientation`
 * property a v10 screen may have set is ignored rather than half-honored; panels open on click only,
 * never on hover; and item templates are not supported.
 */
export function MegaMenu({ items = [], ...rest }: MegaMenuProps) {
    const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

    useEffect(() => {
        const close = () => setOpenIndex(undefined);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    return (
        <div
            {...rest}
            role='menubar'
            className='relative flex items-center gap-2 p-3'
            style={barStyle}
            onKeyDown={(event) => {
                if (event.key === 'Escape') setOpenIndex(undefined);
            }}>
            {items.map((item, index) => {
                const columns = item.items ?? [];

                return (
                    <div key={index} role='none' className='relative'>
                        {columns.length > 0 ? (
                            <>
                                <button
                                    type='button'
                                    role='menuitem'
                                    className='inline-flex items-center gap-2'
                                    style={triggerStyle}
                                    disabled={item.disabled}
                                    aria-haspopup='true'
                                    aria-expanded={openIndex === index}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenIndex(openIndex === index ? undefined : index);
                                    }}>
                                    <MenuItemContent item={item} />
                                    <i className='pi pi-angle-down' aria-hidden='true' />
                                </button>
                                {openIndex === index && (
                                    <div role='menu' aria-label={item.label} className='flex gap-4 p-3' style={panelStyle}>
                                        {columns.map((column, columnIndex) => (
                                            <div key={columnIndex} role='group' aria-label={column.label} className='flex flex-col gap-1'>
                                                <span className='text-sm font-semibold' style={columnHeadingStyle}>
                                                    {column.label}
                                                </span>
                                                {(column.items ?? []).map((child, childIndex) => (
                                                    <MenuItemAction
                                                        key={childIndex}
                                                        item={child}
                                                        role='menuitem'
                                                        className='flex items-center gap-2'
                                                        style={columnItemStyle}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <MenuItemAction item={item} role='menuitem' className='inline-flex items-center gap-2' style={triggerStyle} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
