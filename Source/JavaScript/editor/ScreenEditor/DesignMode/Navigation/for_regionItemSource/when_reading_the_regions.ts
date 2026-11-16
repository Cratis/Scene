// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind, OutletItemKind, OutletKind, OutletMode, type NavigationModel } from '@cratis/scene.model';
import { regionSource } from '../given/applicationNavigation';

const { Topbar, Sidebar } = NavigationRegionKind;

describe('when reading the application level', () => {
    const topbar = regionSource(Topbar, undefined);
    it('should list the application items, all editable', () => { topbar.items.map(item => item.label).should.deep.equal(['Dashboard', 'Sales', 'Support']); topbar.items.every(item => !item.readOnly).should.be.true; });
    it('should tag the region "defined here" (NAV13)', () => topbar.regionTag!.text.should.equal('defined here'));
    it('should have no mode: the application is the base', () => (topbar.region!.mode === undefined).should.be.true);
    it('should name what each item leads to', () => topbar.items[1].chips!.target.should.equal('Sales'));
});

describe('when reading a module that inherits a region', () => {
    const topbar = regionSource(Topbar, 'sales');
    it('should list the application items read-only, saying who owns them (NAV3, NAV7)', () => {
        topbar.items.map(item => item.label).should.deep.equal(['Dashboard', 'Sales', 'Support']);
        topbar.items.every(item => item.readOnly && item.origin === 'Application' && item.readOnlyReason === 'item.inherited').should.be.true;
    });
    it('should tag the region "inherited" and say it in full for the tooltip', () => { topbar.regionTag!.text.should.equal('inherited'); topbar.regionTag!.long.should.equal('Topbar · inherits the application'); });
    it('should know the mode is inherit', () => topbar.region!.mode!.should.equal('inherit'));
});

describe('when reading a module that extends a region', () => {
    const sidebar = regionSource(Sidebar, 'sales');
    it('should list the inherited items first and then its own', () => sidebar.items.map(item => item.label).should.deep.equal(['Dashboard', 'Orders', 'Customers', 'Pipeline']));
    it('should count positions among its own items', () => sidebar.items.map(item => item.index).should.deep.equal([-1, 0, 1, 2]));
    it('should tag it "Application + Sales"', () => { sidebar.regionTag!.text.should.equal('Application + Sales'); sidebar.regionTag!.long.should.equal('Sidebar · extends application'); });
    it('should name a feature target by its names', () => sidebar.items[1].chips!.target.should.equal('Sales'.concat(' › Orders')));
});

describe('when reading a module that overrides a region', () => {
    const sidebar = regionSource(Sidebar, 'support');
    it('should list its own items only', () => sidebar.items.map(item => item.label).should.deep.equal(['Tickets', 'Knowledge base']));
    it('should tag it "Support only"', () => sidebar.regionTag!.text.should.equal('Support only'));
});

describe('when an item leads nowhere', () => {
    it('should be flagged unlinked, and carry the engine\'s finding (NAV12)', () => {
        const navigation = { application: { outlets: [{ name: Topbar, kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'nowhere', title: 'Nowhere' }] }] }, modules: [] } as NavigationModel;
        const item = regionSource(Topbar, undefined, navigation).items[0];
        item.unlinked.should.be.true;
        item.problems![0].code.should.equal('navTargetMissing');
    });
});

describe('when an item leads somewhere a module may not link to', () => {
    it('should flag a module linking to another module, and name the finding (NAV12)', () => {
        const navigation = { application: { outlets: [] }, modules: [{ module: 'sales', refinements: [{ outlet: Sidebar, mode: OutletMode.Overrides, items: [{ kind: OutletItemKind.Navigation, id: 'elsewhere', title: 'Elsewhere', target: { module: 'support' } }] }] }] } as NavigationModel;
        const item = regionSource(Sidebar, 'sales', navigation).items[0];
        item.problems!.map(problem => problem.code).should.include('navTargetOutOfScope');
    });

    it('should flag a target that is no longer in the application, and say so in the chip', () => {
        const navigation = { application: { outlets: [{ name: Topbar, kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'gone', title: 'Gone', target: { module: 'retired' } }] }] }, modules: [] } as NavigationModel;
        const item = regionSource(Topbar, undefined, navigation).items[0];
        item.chips!.target.should.equal('retired');
        item.problems!.length.should.be.greaterThan(0);
    });
});
