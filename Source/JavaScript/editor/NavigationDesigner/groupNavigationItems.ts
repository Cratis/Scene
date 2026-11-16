// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationGroup } from './NavigationGroup';
import { NavigationItemWithSource } from './NavigationItemWithSource';

/**
 * Groups already-aggregated navigation items by their `group` field, preserving the incoming (resolved)
 * order both across groups and within each group - part of StudioIssues#158's tree view. Ungrouped items
 * (`group` is `undefined`) form their own group, first-seen-position like every other group, rather than
 * being pinned to a fixed position.
 *
 * @param entries The aggregated {@link NavigationItemWithSource}s, in resolved display order.
 * @returns One {@link NavigationGroup} per distinct `group` value, in first-seen order.
 */
export function groupNavigationItems(entries: NavigationItemWithSource[]): NavigationGroup[] {
    const groups: NavigationGroup[] = [];
    const byName = new Map<string | undefined, NavigationGroup>();

    for (const entry of entries) {
        const name = entry.item.group;
        let group = byName.get(name);
        if (!group) {
            group = { name, items: [] };
            byName.set(name, group);
            groups.push(group);
        }

        group.items.push(entry);
    }

    return groups;
}
