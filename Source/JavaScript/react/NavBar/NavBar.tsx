// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletNavigationItem } from '@cratis/scene.model';

export interface NavBarProps {
    /**
     * The items of an outlet of navigation, in the order they are shown - typically the effective items of the
     * `Navigation` outlet, contributions included (`effectiveOutlet`). An item with sub-items is a group.
     */
    items: OutletNavigationItem[];

    /**
     * Turns a navigation item's target into a concrete route - a URL path, a query string, or a native deep link.
     * Owning this as a caller-supplied function, rather than a fixed URL scheme, is what makes `NavBar` usable
     * unmodified across renderers.
     */
    renderRoute: (item: OutletNavigationItem) => string;
}

/**
 * Renders the items of an outlet of navigation as links. `NavBar` is not wired to a fixed source: pass it the resolved
 * items in scope and it recomputes. An item with sub-items renders as a group of its sub-items; an item without a
 * target that groups nothing is skipped rather than rendered as a broken link.
 * @param props The items and how to turn each into a route.
 * @returns The navigation.
 */
export function NavBar({ items, renderRoute }: NavBarProps) {
    return (
        <nav data-scene-navbar="">
            {items.map(item => (item.children?.length ?? 0) > 0
                ? (
                    <section key={item.id} data-scene-navbar-group={item.title}>
                        {item.children!.filter(child => child.target !== undefined).map(child => <NavBarItem key={child.id} item={child} href={renderRoute(child)} />)}
                    </section>
                )
                : item.target === undefined ? null : <NavBarItem key={item.id} item={item} href={renderRoute(item)} />)}
        </nav>
    );
}

function NavBarItem({ item, href }: { item: OutletNavigationItem; href: string }) {
    return <a href={href}>{item.title}</a>;
}
