// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type OutletContribution, type OutletNavigationItem } from '@cratis/scene.model';
import { groupNavigationItems } from '../groupNavigationItems';
import { NavigationGroup } from '../NavigationGroup';
import { NavigationItemWithSource } from '../NavigationItemWithSource';

function entry(label: string, group: string | undefined): NavigationItemWithSource {
    const navigationItem: OutletNavigationItem = { kind: OutletItemKind.Navigation, id: label, title: label };
    const source: OutletContribution = { outlet: 'Navigation', items: [navigationItem] };
    return { item: { id: label, label, target: `${label}Screen`, item: navigationItem, ...(group === undefined ? {} : { group }) }, source };
}

describe('when grouping items', () => {
    let result: NavigationGroup[];

    beforeEach(() => {
        result = groupNavigationItems([
            entry('Dashboard', 'Overview'),
            entry('Settings', undefined),
            entry('Reports', 'Overview'),
        ]);
    });

    it('should form one group per distinct group name, in first-seen order', () => {
        result.map(group => group.name).should.deep.equal(['Overview', undefined]);
    });

    it('should keep every item with the same group name together, preserving order', () => {
        result[0].items.map(entry => entry.item.label).should.deep.equal(['Dashboard', 'Reports']);
    });

    it('should place ungrouped items in their own group', () => {
        result[1].items.map(entry => entry.item.label).should.deep.equal(['Settings']);
    });
});
