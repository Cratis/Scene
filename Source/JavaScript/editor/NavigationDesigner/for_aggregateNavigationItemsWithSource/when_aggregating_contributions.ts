// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type OutletContribution } from '@cratis/scene.model';
import { aggregateNavigationItemsWithSource } from '../aggregateNavigationItemsWithSource';
import { NavigationItemWithSource } from '../NavigationItemWithSource';

const orders: OutletContribution = {
    outlet: 'Navigation',
    items: [{ kind: OutletItemKind.Navigation, id: 'orders', title: 'Orders', target: { module: 'Sales', feature: 'Orders' } }],
};

const reports: OutletContribution = {
    outlet: 'Navigation',
    items: [{
        kind: OutletItemKind.Navigation, id: 'reports', title: 'Reports',
        children: [{ kind: OutletItemKind.Navigation, id: 'monthly', title: 'Monthly', target: { module: 'Reports', feature: 'Monthly' } }],
    }],
};

const toolbar: OutletContribution = {
    outlet: 'actions',
    items: [{ kind: OutletItemKind.Button, id: 'add', title: 'Add' }],
};

describe('when aggregating outlet contributions', () => {
    let result: NavigationItemWithSource[];

    beforeEach(() => {
        result = aggregateNavigationItemsWithSource([orders, toolbar, reports]);
    });

    it('should list only the navigation items of the navigation outlet', () => result.map(entry => entry.item.id).should.deep.equal(['orders', 'monthly']));
    it('should name what an item leads to', () => result[0].item.target.should.equal('Sales.Orders'));
    it('should put a sub-item under the title of the item it sits under', () => result[1].item.group!.should.equal('Reports'));
    it('should pair each item with the contribution it came from', () => result[1].source.should.equal(reports));
});
