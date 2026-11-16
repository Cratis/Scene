// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { refinementAt } from '../../../Outlets/outletDocument';
import { carryOut, catalogDocument, designOf, labelsOf, products } from '../given/productCatalog';

describe('when hiding an inherited button at a feature', () => {
    let document = catalogDocument();
    const design = () => designOf(document, 'toolbar', products);
    document = carryOut(document, design().hide(design().items.find(item => item.id === 'export')!));
    const hidden = design();

    it('should no longer show it', () => labelsOf(hidden).should.not.contain('Export'));
    it('should still list it, hidden', () => hidden.removed.map(item => [item.label, item.removal]).should.deep.equal([['Export', 'hidden']]));
    it('should extend, which is what hides', () => hidden.mode.should.equal('extend'));
    it('should offer to bring it back', () => hidden.readOnlyActions(hidden.removed[0]).map(action => action.id).should.deep.equal(['bringBack']));

    describe('and bringing it back', () => {
        const back = carryOut(document, hidden.bringBack(hidden.removed[0]));
        it('should show it again where it was', () => labelsOf(designOf(back, 'toolbar', products)).should.deep.equal(['Refresh', 'Export', 'Add product', 'Set price']));
        it('should leave nothing hidden', () => (refinementAt(back, products, 'toolbar')?.hide === undefined).should.be.true);
    });
});

describe('when hiding a contributed button', () => {
    const document = catalogDocument();
    const design = designOf(document, 'toolbar', products);
    const after = designOf(carryOut(document, design.hide(design.items.find(item => item.id === 'setPrice')!)), 'toolbar', products);
    it('should hide it too', () => labelsOf(after).should.not.contain('Set price'));
    it('should list it as hidden', () => after.removed.map(item => item.id).should.deep.equal(['setPrice']));
});

describe('when hiding an item the level owns', () => {
    it('should refuse: an own item is deleted, not hidden', () => {
        const document = carryOut(catalogDocument(), designOf(catalogDocument(), 'filters', products).add('addFilter'));
        const design = designOf(document, 'filters', products);
        design.hide(design.items[1]).should.deep.equal({ rejected: 'ownItem' });
    });
});
