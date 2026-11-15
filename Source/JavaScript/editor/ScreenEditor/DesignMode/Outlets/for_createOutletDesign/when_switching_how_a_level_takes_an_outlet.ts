// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletMode } from '@cratis/scene.model';
import { refinementAt } from '../../../Outlets/outletDocument';
import { carryOut, catalogDocument, designOf, labelsOf, products } from '../given/productCatalog';

describe('when a feature overrides the toolbar and copies the inherited items', () => {
    const document = carryOut(catalogDocument(), designOf(catalogDocument(), 'toolbar', products).setMode('override', true));
    const design = designOf(document, 'toolbar', products);
    it('should override', () => design.mode.should.equal('override'));
    it('should start from copies of the inherited items, which are now its own', () => {
        labelsOf(design).should.deep.equal(['Refresh', 'Export', 'Add product', 'Set price']);
        design.items.slice(0, 3).every(item => !item.readOnly).should.be.true;
    });
    it('should keep the contribution, which belongs to the feature that made it', () => design.items[3].provenance!.source.should.equal('contribution'));
    it('should keep the mode on the feature', () => refinementAt(document, products, 'toolbar')!.mode!.should.equal(OutletMode.Overrides));
});

describe('when a feature overrides the toolbar and starts empty', () => {
    const document = carryOut(catalogDocument(), designOf(catalogDocument(), 'toolbar', products).setMode('override'));
    const design = designOf(document, 'toolbar', products);
    it('should show only the contribution', () => labelsOf(design).should.deep.equal(['Set price']));
    it('should list the inherited items as overridden, struck through', () => design.removed.map(item => [item.label, item.removal]).should.deep.equal([['Refresh', 'overridden'], ['Export', 'overridden'], ['Add product', 'overridden']]));

    describe('and bringing one back', () => {
        const back = designOf(carryOut(document, design.bringBack(design.removed[1])), 'toolbar', products);
        it('should make it the feature\'s own', () => labelsOf(back).should.deep.equal(['Export', 'Set price']));
    });

    describe('and going back to inherit', () => {
        const inherited = carryOut(document, design.setMode('inherit'));
        it('should drop the feature\'s refinement', () => (refinementAt(inherited, products, 'toolbar') === undefined).should.be.true);
        it('should show the inherited items again', () => labelsOf(designOf(inherited, 'toolbar', products)).should.deep.equal(['Refresh', 'Export', 'Add product', 'Set price']));
    });
});

describe('when choosing the mode a level already has', () => {
    it('should refuse', () => designOf(catalogDocument(), 'toolbar', products).setMode('inherit').should.deep.equal({ rejected: 'sameMode' }));
});
