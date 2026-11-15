// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind } from '@cratis/scene.model';
import { catalog, catalogDocument, designOf, labelsOf, products, theScreen } from '../given/productCatalog';

describe('when reading the toolbar of a feature below a module that extends it', () => {
    const toolbar = designOf(catalogDocument(), 'toolbar', products);

    it('should be an outlet of actions', () => toolbar.outletKind.should.equal(OutletKind.Actions));
    it('should say the template declares it', () => toolbar.declaredBy!.should.equal('ListPage'));
    it('should list the inherited items, then the contributions', () => labelsOf(toolbar).should.deep.equal(['Refresh', 'Export', 'Add product', 'Set price']));
    it('should keep every inherited item read-only, saying who owns it', () => {
        toolbar.items.every(item => item.readOnly).should.be.true;
        toolbar.items.map(item => item.origin).should.deep.equal(['ListPage', 'ListPage', 'Catalog', 'Pricing']);
    });
    it('should say a contributed item comes from the feature that contributes it', () => toolbar.items[3].provenance!.source.should.equal('contribution'));
    it('should inherit at the feature', () => toolbar.mode.should.equal('inherit'));
    it('should tag it with where the items come from, as Scene says it', () => toolbar.regionTag!.text.should.equal(toolbar.effective.summary));
    it('should name the module in the tag', () => toolbar.effective.summary.should.contain('Catalog'));
});

describe('when reading the toolbar at the module that extends it', () => {
    const toolbar = designOf(catalogDocument(), 'toolbar', catalog);
    it('should know the module extends it', () => toolbar.mode.should.equal('extend'));
    it('should let the module change its own item', () => toolbar.items.find(item => item.id === 'addProduct')!.readOnly.should.be.false);
    it('should count the own item among its own', () => toolbar.items.find(item => item.id === 'addProduct')!.index.should.equal(0));
});

describe('when reading an outlet of each kind at the screen', () => {
    const kinds = ['filters', 'stats', 'detailTabs', 'sections'].map(name => designOf(catalogDocument(), name, theScreen));
    it('should know each kind', () => kinds.map(design => design.outletKind).should.deep.equal([OutletKind.Filters, OutletKind.Stats, OutletKind.Tabs, OutletKind.Navigation]));
    it('should give each kind the "+" of its items', () => kinds.map(design => design.designMode.addActions[0].id).should.deep.equal(['addFilter', 'addStat', 'addTab', 'addItem']));
    it('should flag a stat that takes its value from nothing', () => kinds[1].items[0].unlinked.should.be.true);
    it('should name the screen a tab shows', () => kinds[2].items[0].chips!.shows.should.equal('Product overview'));
    it('should give a tabs outlet the slot it owns', () => kinds[2].slot!.should.equal('detail'));
});

describe('when reading an outlet no level declares', () => {
    it('should have no design', () => (() => designOf(catalogDocument(), 'nowhere')).should.throw('no outlet nowhere'));
});
