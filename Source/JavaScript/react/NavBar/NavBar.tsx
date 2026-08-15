// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Contribution, NavigationItem } from '@cratis/scene.model';
import { aggregateContributions } from '@cratis/scene.engine';
import { extractNavigationItem } from './extractNavigationItem';

export interface NavBarProps {
    /** Every contribution in scope - `NavBar` aggregates the ones targeting `Navigation` itself. */
    contributions: Contribution[];

    /**
     * Turns a {@link NavigationItem}'s target screen and route parameters into a concrete route - a URL
     * path, a query string, or a native deep link. Owning this as a caller-supplied function, rather than
     * a fixed URL scheme, is what makes `NavBar` usable unmodified across renderers (Cratis/Scene#2).
     */
    renderRoute: (item: NavigationItem) => string;
}

/**
 * Renders the aggregated `Navigation` contributions from across the current element tree - part of
 * Cratis/Scene#2. `NavBar` is not wired to a fixed source: pass it whatever contributions are currently
 * in scope and it recomputes, the same way any contribution-point consumer does.
 */
export function NavBar({ contributions, renderRoute }: NavBarProps) {
    const items = aggregateContributions(contributions, 'Navigation')
        .map(extractNavigationItem)
        .filter((item): item is NavigationItem => item !== undefined);

    const hasGroups = items.some(item => item.group !== undefined);
    if (!hasGroups) {
        return (
            <nav data-scene-navbar="">
                {items.map(item => <NavBarItem key={item.targetScreen} item={item} href={renderRoute(item)} />)}
            </nav>
        );
    }

    const groupNames = [...new Set(items.map(item => item.group ?? ''))];
    return (
        <nav data-scene-navbar="">
            {groupNames.map(groupName => (
                <section key={groupName} data-scene-navbar-group={groupName}>
                    {items.filter(item => (item.group ?? '') === groupName).map(item => <NavBarItem key={item.targetScreen} item={item} href={renderRoute(item)} />)}
                </section>
            ))}
        </nav>
    );
}

function NavBarItem({ item, href }: { item: NavigationItem; href: string }) {
    return <a href={href}>{item.label}</a>;
}
