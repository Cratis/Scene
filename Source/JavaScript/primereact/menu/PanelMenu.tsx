// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes } from 'react';
import { Accordion } from 'primereact/accordion';
import { MenuItem } from '../MenuItem';
import { MenuItemAction } from './MenuItemAction';
import { MenuItemContent } from './MenuItemContent';

const rootStyle: CSSProperties = { color: 'var(--scene-text-color)', width: '16rem' };

const headerStyle: CSSProperties = {
    background: 'var(--scene-surface-card)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    justifyContent: 'space-between',
    textAlign: 'left',
    textDecoration: 'none',
    width: '100%',
};

const listStyle: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 };

const childStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
    textDecoration: 'none',
    width: '100%',
};

/**
 * The configuration {@link PanelMenu} takes.
 *
 * `defaultValue` is omitted from the inherited attributes because the props are spread onto
 * `Accordion.Root`, which has a `defaultValue` of its own meaning "the panels open to begin with".
 * `HTMLAttributes` declares the form-control `defaultValue` (which includes `readonly string[]`), and the
 * two are not assignable. Dropping it is the honest resolution: a `<div>` has no default value, so nothing
 * is lost, and leaving both in scope would let a caller set one and silently get the other.
 */
export interface PanelMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
    /**
     * The commands to show. A top-level entry with children becomes an expandable panel; one without
     * stays a plain row.
     */
    items?: MenuItem[];

    /**
     * Whether more than one panel may be open at once.
     */
    multiple?: boolean;
}

/**
 * A vertical menu whose sections expand in place, accordion style. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/panelmenu` outright. Unlike the other removals in
 * this folder, though, the mechanism it needed did survive: `primereact/accordion` is exactly the
 * expand-collapse behavior a panel menu is, so this composes the v11 `Accordion` parts rather than
 * hand-rolling open state. That is worth doing rather than clever - the accordion already brings the
 * `aria-expanded` and `aria-controls` wiring between a trigger and its content, the disabled handling, and
 * the single-versus-multiple open policy, and every one of those is a thing a hand-rolled version would
 * get subtly wrong. What is Cratis's here is only the mapping from a Scene item model onto those parts.
 *
 * What it deliberately does not carry over from the v10 `PanelMenu`: sections expand exactly one level
 * deep rather than nesting arbitrarily, because an accordion panel holds content and not another
 * accordion; there is no keyboard model beyond the accordion's own; and item templates are not supported.
 */
export function PanelMenu({ items = [], multiple = false, ...rest }: PanelMenuProps) {
    return (
        <Accordion.Root {...rest} multiple={multiple} className='flex flex-col gap-1' style={rootStyle}>
            {items.map((item, index) => {
                const children = item.items ?? [];

                if (children.length === 0) return <MenuItemAction key={index} item={item} className='flex items-center gap-2 p-3' style={headerStyle} />;

                return (
                    <Accordion.Panel key={index} value={String(index)} disabled={item.disabled}>
                        <Accordion.Header>
                            <Accordion.Trigger className='flex items-center gap-2 p-3' style={headerStyle}>
                                <MenuItemContent item={item} />
                                <Accordion.Indicator>
                                    <i className='pi pi-chevron-down' aria-hidden='true' />
                                </Accordion.Indicator>
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                            <ul role='menu' aria-label={item.label} style={listStyle}>
                                {children.map((child, childIndex) => (
                                    <li key={childIndex} role='none'>
                                        <MenuItemAction item={child} role='menuitem' className='flex items-center gap-2 p-3' style={childStyle} />
                                    </li>
                                ))}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Panel>
                );
            })}
        </Accordion.Root>
    );
}
