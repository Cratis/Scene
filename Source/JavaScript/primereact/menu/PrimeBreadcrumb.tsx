// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment, ReactNode } from 'react';
import { Breadcrumb } from 'primereact/breadcrumb';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { MenuItem } from '../MenuItem';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';
import { MenuItemContent } from './MenuItemContent';

/**
 * One entry in the trail, as the strongest thing the authored data supports.
 *
 * The three cases are genuinely different to assistive technology and only one of them is a link. Where
 * the user already is gets `Breadcrumb.Current`, which carries `aria-current="page"` and is what tells a
 * screen reader the trail has ended - a trailing link says the opposite. An earlier entry that names a
 * target is a link. An earlier entry that names none is plain text, because an anchor with no `href` is
 * not focusable and only looks like a link.
 *
 * @param item The entry to render.
 * @param current Whether this is the last entry, and so where the user is now.
 * @returns The rendered entry.
 */
function breadcrumbEntry(item: MenuItem, current: boolean): ReactNode {
    if (current) {
        return (
            <Breadcrumb.Current>
                <MenuItemContent item={item} />
            </Breadcrumb.Current>
        );
    }

    if (item.url === undefined) return <MenuItemContent item={item} />;

    return (
        <Breadcrumb.Link href={item.url}>
            <MenuItemContent item={item} />
        </Breadcrumb.Link>
    );
}

/**
 * The `PrimeReact:breadcrumb` component - the path to where the user currently is.
 *
 * The home entry is separate from the trail in the authored model, so it is read from its own `homeUrl`
 * property and always rendered as an icon.
 *
 * PrimeReact 11 replaced the single `BreadCrumb` component and its `model`/`home` props with a namespace
 * of parts, so the trail is assembled here. The parts are worth assembling rather than working around:
 * the root is a `nav` carrying an accessible name, the list is an ordered list, and every separator is
 * marked presentational so it is never read out as part of the path. The old `model` prop produced all of
 * that too, but only because the component decided it - none of it is something a hand-rolled trail would
 * reliably reproduce.
 */
export function PrimeBreadcrumb({ element }: RegisteredComponentProps) {
    const items = menuItemsProperty(element, 'items');

    return (
        <Breadcrumb.Root data-scene-id={element.id}>
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href={stringProperty(element, 'homeUrl', '/')} aria-label='Home'>
                        <i className='pi pi-home' aria-hidden='true' />
                    </Breadcrumb.Link>
                </Breadcrumb.Item>
                {items.map((item, index) => (
                    <Fragment key={index}>
                        <Breadcrumb.Separator>
                            <i className='pi pi-angle-right' aria-hidden='true' />
                        </Breadcrumb.Separator>
                        <Breadcrumb.Item>{breadcrumbEntry(item, index === items.length - 1)}</Breadcrumb.Item>
                    </Fragment>
                ))}
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
}
