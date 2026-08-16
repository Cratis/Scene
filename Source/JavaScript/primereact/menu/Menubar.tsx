// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes, ReactNode, useEffect, useState } from 'react';
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
    minWidth: '12rem',
    background: 'var(--scene-surface-overlay)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
};

const panelItemStyle: CSSProperties = { ...triggerStyle, width: '100%', textAlign: 'left' };

const separatorStyle: CSSProperties = { border: 'none', borderTop: '1px solid var(--scene-surface-border)', margin: 0 };

/**
 * The configuration {@link Menubar} takes.
 */
export interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The commands to show, top level across the bar and one level of children in a dropdown.
     */
    items?: MenuItem[];

    /**
     * Content pinned before the commands - branding, in a real application.
     */
    start?: ReactNode;

    /**
     * Content pinned after the commands - account and status controls, in a real application.
     */
    end?: ReactNode;
}

/**
 * A horizontal bar of commands, each of which may drop down a panel of its children. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/menubar` outright, with no successor component
 * and no headless hook to rebuild it from - unlike `menu`, `breadcrumb` and `contextmenu`, which survived
 * as compositional part namespaces. Scene still has to render an element authored as a menubar, so the
 * component is Scene's now. It follows `ActionMenubar` in `@cratis/components`, which is the same answer
 * Cratis already reached for its own bar of actions after the v11 removal.
 *
 * What it deliberately does not carry over from the v10 `Menubar`: submenus nest exactly one level rather
 * than arbitrarily deep (author a `tieredMenu` when a third level is genuinely needed); panels open on
 * click only, never on hover; there is no responsive collapse to a hamburger at narrow widths; there is
 * no roving-focus keyboard model across the bar, only the tab order and Escape the browser and this
 * component give for free; and item templates are not supported, since a Scene item model has no place to
 * put a React node.
 *
 * A panel does close when the pointer goes elsewhere on the page. That is not a feature carried over so
 * much as the absence of a defect - a dropdown that survives a click on the rest of the screen is broken,
 * not minimal.
 */
export function Menubar({ items = [], start, end, ...rest }: MenubarProps) {
    const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

    useEffect(() => {
        const close = () => setOpenIndex(undefined);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    return (
        <div
            {...rest}
            className='relative flex items-center gap-2 p-3'
            style={barStyle}
            onKeyDown={(event) => {
                if (event.key === 'Escape') setOpenIndex(undefined);
            }}>
            {start}
            <div role='menubar' className='flex items-center gap-2'>
                {items.map((item, index) => {
                    const children = item.items ?? [];

                    return (
                        <div key={index} role='none' className='relative'>
                            {children.length > 0 ? (
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
                                        <div role='menu' aria-label={item.label} className='flex flex-col' style={panelStyle}>
                                            {children.map((child, childIndex) =>
                                                child.separator === true ? (
                                                    <hr key={childIndex} style={separatorStyle} />
                                                ) : (
                                                    <MenuItemAction
                                                        key={childIndex}
                                                        item={child}
                                                        role='menuitem'
                                                        className='flex items-center gap-2 p-3'
                                                        style={panelItemStyle}
                                                    />
                                                )
                                            )}
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
            {end}
        </div>
    );
}
