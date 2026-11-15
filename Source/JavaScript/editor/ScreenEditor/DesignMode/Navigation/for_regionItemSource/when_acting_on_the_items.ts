// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind } from '@cratis/scene.model';
import { applicationNavigation, carryOut, regionSource, titlesOf } from '../given/applicationNavigation';

const { Topbar, Sidebar } = NavigationRegionKind;

describe('when "+" is pressed on a region the module inherits', () => {
    const before = applicationNavigation();
    const { navigation, plan } = carryOut(before, regionSource(Topbar, 'sales', before).add('addItem'));
    it('should switch the region to extend and add the item (NAV6)', () => titlesOf(navigation, Topbar, 'sales').should.deep.equal(['Dashboard', 'Sales', 'Support', 'New item']));
    it('should keep the application items read-only and the new one editable', () => regionSource(Topbar, 'sales', navigation).items.map(item => item.readOnly).should.deep.equal([true, true, true, false]));
    it('should say the region now extends the inherited items (p13-3)', () => plan.notice!.should.equal('Region now extends the inherited items'));
    it('should tag it "Application + Sales"', () => regionSource(Topbar, 'sales', navigation).regionTag!.text.should.equal('Application + Sales'));
    it('should select the new item and open its title for typing', () => { plan.select!.itemId!.should.match(/^new-/); plan.renameNext!.should.be.true; });
    it('should leave the model it was given alone', () => titlesOf(before, Topbar, 'sales').should.have.length(3));
});

describe('when "+" is pressed on a region the module already extends', () => {
    it('should add the item without a notice', () => { const outcome = regionSource(Sidebar, 'sales').add('addItem'); ('rejected' in outcome ? false : outcome.notice === undefined).should.be.true; });
});

describe('when "+" is pressed on the application level', () => {
    it('should add the item to the application region', () => titlesOf(carryOut(applicationNavigation(), regionSource(Topbar, undefined).add('addItem')).navigation, Topbar, undefined).should.deep.equal(['Dashboard', 'Sales', 'Support', 'New item']));
});

describe('when the region of a module is switched', () => {
    const source = regionSource(Topbar, 'sales');
    const overrideHere = source.readOnlyActions(source.items[0]).find(action => action.id === 'overrideHere')!;
    const { navigation } = carryOut(applicationNavigation(), overrideHere.plan());
    it('should copy the application items when overriding, so they can be edited (NAV5)', () => titlesOf(navigation, Topbar, 'sales').should.deep.equal(['Dashboard', 'Sales', 'Support']));
    it('should make the copies the module\'s own, editable', () => regionSource(Topbar, 'sales', navigation).items.every(item => !item.readOnly).should.be.true);
    it('should tag it "Sales only"', () => regionSource(Topbar, 'sales', navigation).regionTag!.text.should.equal('Sales only'));
});

describe('when asking what can be done to an inherited item', () => {
    const source = regionSource(Topbar, 'sales');
    it('should offer to override here and to edit at the application level (NAV7)', () => source.readOnlyActions(source.items[0]).map(action => action.label).should.deep.equal(['Override here', 'Edit at application level']));
    it('should have "edit at application level" move the editor, with no edit', () => { const plan = source.readOnlyActions(source.items[0])[1].plan(); ('rejected' in plan ? false : plan.editAtApplication === true && plan.navigationEdits === undefined).should.be.true; });
    it('should offer nothing at the application level, where nothing is inherited', () => { const application = regionSource(Topbar, undefined); application.readOnlyActions(application.items[0]).should.be.empty; });
});

describe('when an own item is renamed, linked and given a slot', () => {
    const source = regionSource(Sidebar, 'sales');
    const orders = source.items[1];
    it('should rename it', () => titlesOf(carryOut(applicationNavigation(), source.rename(orders, 'Sales orders')).navigation, Sidebar, 'sales')[1].should.equal('Sales orders'));
    it('should link it to a feature', () => {
        const choice = source.choice('target', orders)!;
        choice.property.descriptor.editorKind!.should.equal('navigationItemTarget');
        const { navigation } = carryOut(applicationNavigation(), choice.plan({ module: 'sales', feature: 'pipeline' }));
        regionSource(Sidebar, 'sales', navigation).items[1].chips!.target.should.equal('Sales › Pipeline');
    });
    it('should unlink it', () => regionSource(Sidebar, 'sales', carryOut(applicationNavigation(), source.choice('target', orders)!.plan(undefined)).navigation).items[1].unlinked.should.be.true);
    it('should render it into a slot, and into the main area again', () => {
        const aside = carryOut(applicationNavigation(), source.choice('slot', orders)!.plan('aside')).navigation;
        regionSource(Sidebar, 'sales', aside).items[1].values.slot!.should.equal('aside');
        regionSource(Sidebar, 'sales', carryOut(aside, regionSource(Sidebar, 'sales', aside).choice('slot', orders)!.plan('content')).navigation).items[1].values.slot!.should.equal('content');
    });
    it('should flag a slot the layout does not have (NAV12)', () => regionSource(Sidebar, 'sales', carryOut(applicationNavigation(), source.choice('slot', orders)!.plan('footer')).navigation).items[1].problems![0].code.should.equal('navSlotUnknown'));
    it('should offer no choice for an item it does not own', () => (source.choice('target', source.items[0]) === undefined).should.be.true);
});

describe('when own items are moved, duplicated and removed', () => {
    const source = regionSource(Sidebar, 'sales');
    const customers = source.items[2];
    const sidebar = (navigation: Parameters<typeof titlesOf>[0]) => titlesOf(navigation, Sidebar, 'sales');
    it('should move later', () => sidebar(carryOut(applicationNavigation(), source.act('moveLater', customers)).navigation).should.deep.equal(['Dashboard', 'Orders', 'Pipeline', 'Customers']));
    it('should move earlier', () => sidebar(carryOut(applicationNavigation(), source.act('moveEarlier', customers)).navigation).should.deep.equal(['Dashboard', 'Customers', 'Orders', 'Pipeline']));
    it('should not move the first of its own items earlier, past the inherited ones', () => source.act('moveEarlier', source.items[1]).should.deep.equal({ rejected: 'noWhere' }));
    it('should duplicate right after itself, linked the same', () => {
        const { navigation, plan } = carryOut(applicationNavigation(), source.act('duplicate', customers));
        sidebar(navigation).should.deep.equal(['Dashboard', 'Orders', 'Customers', 'Customers', 'Pipeline']);
        regionSource(Sidebar, 'sales', navigation).items.find(item => item.id === plan.select!.itemId)!.chips!.target.should.equal('Sales › Customers');
    });
    it('should be removed, selecting the one after it', () => { const { navigation, plan } = carryOut(applicationNavigation(), source.act('delete', customers)); sidebar(navigation).should.deep.equal(['Dashboard', 'Orders', 'Pipeline']); plan.select!.itemId!.should.equal('pipeline'); });
});

describe('when sub-items are added to a sidebar item (NAV10)', () => {
    const source = regionSource(Sidebar, 'sales');
    const { navigation, plan } = carryOut(applicationNavigation(), source.act('addSubItem', source.items[1]));
    it('should put the new item under the one it was added to', () => titlesOf(navigation, Sidebar, 'sales').should.deep.equal(['Dashboard', 'Orders', '  New item', 'Customers', 'Pipeline']));
    it('should know its parent', () => regionSource(Sidebar, 'sales', navigation).items.find(item => item.id === plan.select!.itemId)!.parentId!.should.equal('orders'));
    it('should not offer a sub-item of a sub-item', () => { const nested = regionSource(Sidebar, 'sales', navigation); nested.act('addSubItem', nested.items.find(item => item.parentId)!).should.deep.equal({ rejected: 'subItemOfSubItem' }); });
    it('should be refused on a topbar, which is flat', () => regionSource(Topbar, undefined).act('addSubItem', regionSource(Topbar, undefined).items[0]).should.have.property('rejected'));
    it('should move among its siblings and be removed with its parent', () => {
        const nested = regionSource(Sidebar, 'sales', navigation);
        titlesOf(carryOut(navigation, nested.act('delete', nested.items[1])).navigation, Sidebar, 'sales').should.deep.equal(['Dashboard', 'Customers', 'Pipeline']);
    });
});
