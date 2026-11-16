// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletMode } from '@cratis/scene.model';
import { refinementAt } from '../../../Outlets/outletDocument';
import { carryOut, catalog, catalogDocument, designOf, labelsOf, products, theScreen } from '../given/productCatalog';
import type { DesignModePlan } from '../../designModeTypes';

describe('when adding a filter at a feature that inherits the filters', () => {
    const before = designOf(catalogDocument(), 'filters', products);
    const plan = before.add('addFilter') as DesignModePlan;
    const document = carryOut(catalogDocument(), plan);
    const after = designOf(document, 'filters', products);

    it('should switch the feature to extend, and say so', () => { after.mode.should.equal('extend'); plan.notice!.should.equal('This level now extends the inherited items'); });
    it('should add a filter after the inherited one', () => labelsOf(after).should.deep.equal(['Search', 'New filter']));
    it('should keep it with the feature', () => refinementAt(document, products, 'filters')!.items![0].kind.should.equal(OutletItemKind.Filter));
    it('should ask for its title to be typed', () => plan.renameNext!.should.be.true);
    it('should flag it until it sets a parameter', () => after.items[1].unlinked.should.be.true);
});

describe('when the "+" of another kind is asked of an outlet', () => {
    it('should refuse it', () => designOf(catalogDocument(), 'filters', products).add('addTab').should.deep.equal({ rejected: 'addTab' }));
});

describe('when renaming, moving, duplicating and deleting the items a module owns', () => {
    let document = catalogDocument();
    const design = () => designOf(document, 'toolbar', catalog);
    document = carryOut(document, design().add('addButton'));
    const added = design().items.find(item => item.label === 'New button')!;
    document = carryOut(document, design().rename(added, 'Archive'));
    const renamed = labelsOf(design());
    document = carryOut(document, design().act('moveEarlier', design().items.find(item => item.label === 'Archive')!));
    const moved = labelsOf(design());
    document = carryOut(document, design().act('duplicate', design().items.find(item => item.label === 'Archive')!));
    const duplicated = labelsOf(design());
    document = carryOut(document, design().act('delete', design().items.find(item => item.label === 'Add product')!));

    it('should rename it', () => renamed.should.contain('Archive'));
    it('should move it among the module\'s own items, never above the inherited ones', () => moved.should.deep.equal(['Refresh', 'Export', 'Archive', 'Add product', 'Set price']));
    it('should duplicate it right after itself', () => duplicated.should.deep.equal(['Refresh', 'Export', 'Archive', 'Archive', 'Add product', 'Set price']));
    it('should delete it', () => labelsOf(design()).should.deep.equal(['Refresh', 'Export', 'Archive', 'Archive', 'Set price']));
    it('should keep the module extending', () => refinementAt(document, catalog, 'toolbar')!.mode!.should.equal(OutletMode.Extends));
});

describe('when acting on an inherited item', () => {
    const design = designOf(catalogDocument(), 'toolbar', products);
    it('should refuse to rename it', () => design.rename(design.items[0], 'Reload').should.have.property('rejected'));
    it('should refuse to move it', () => design.act('moveLater', design.items[0]).should.have.property('rejected'));
    it('should offer to hide it', () => design.readOnlyActions(design.items[0]).map(action => action.id).should.deep.equal(['hide']));
});

describe('when a contributed item from another feature is shown', () => {
    const design = designOf(catalogDocument(), 'toolbar', products);
    const contributed = design.items.find(item => item.id === 'setPrice')!;
    it('should not be movable above the inherited items', () => design.act('moveEarlier', contributed).should.have.property('rejected'));
    it('should come after every inherited item', () => design.items.indexOf(contributed).should.equal(design.items.length - 1));
});

describe('when adding a sub-item to a navigation item the screen owns', () => {
    let document = catalogDocument();
    const design = () => designOf(document, 'sections', theScreen);
    document = carryOut(document, design().add('addItem'));
    const parent = design().items.find(item => item.label === 'New item')!;
    document = carryOut(document, design().act('addSubItem', parent));
    it('should nest it under the item', () => labelsOf(design()).should.deep.equal(['All products', 'New item', '  New item']));
    it('should not nest a sub-item under a sub-item', () => design().act('addSubItem', design().items[2]).should.have.property('rejected'));
});
