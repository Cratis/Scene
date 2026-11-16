// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type OutletContribution, type OutletNavigationItem } from '@cratis/scene.model';
import { NavigationItem, NavigationItemWithSource } from './NavigationItemWithSource';

/** The outlet of navigation screens contribute their items to unless they name another. */
export const navigationOutlet = 'Navigation';

/**
 * The navigation items every contribution in scope adds to an outlet of navigation, each paired with the {@link OutletContribution} it came from - part of
 * StudioIssues#158's "live AppShell preview showing the computed nav" requirement. A sub-item is listed under the title of the item it sits under, in the order
 * the contributions give them.
 *
 * @param contributions Every outlet contribution in scope.
 * @param outlet The outlet of navigation to list.
 * @returns The navigation items with their source contributions, in display order.
 */
export function aggregateNavigationItemsWithSource(contributions: readonly OutletContribution[], outlet: string = navigationOutlet): NavigationItemWithSource[] {
    return contributions
        .filter(contribution => contribution.outlet === outlet)
        .flatMap(contribution => contribution.items
            .filter((item): item is OutletNavigationItem => item.kind === OutletItemKind.Navigation)
            .flatMap(item => entriesOf(item, undefined).map(entry => ({ item: entry, source: contribution }))));
}

function entriesOf(item: OutletNavigationItem, group: string | undefined): NavigationItem[] {
    const children = item.children ?? [];
    if (children.length > 0) return children.flatMap(child => entriesOf(child, item.title));
    return [{ id: item.id, label: item.title, target: targetOf(item), item, ...(group === undefined ? {} : { group }) }];
}

const targetOf = (item: OutletNavigationItem): string => [item.target?.module, item.target?.feature].filter(Boolean).join('.');

/** Strips the source pairing for callers that only need the plain items. */
export function toNavigationItems(entries: NavigationItemWithSource[]): NavigationItem[] {
    return entries.map(entry => entry.item);
}
