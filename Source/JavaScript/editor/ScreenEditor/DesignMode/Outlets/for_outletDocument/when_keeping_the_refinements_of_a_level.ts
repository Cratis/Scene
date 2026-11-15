// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletMode, type OutletRefinement } from '@cratis/scene.model';
import { navigationOf } from '../../Navigation/navigationDocument';
import { outletLevelsOf, refinementAt, withRefinement, withTemplateOutlets } from '../../../Outlets/outletDocument';
import { catalog, catalogDocument, products } from '../given/productCatalog';

const extending: OutletRefinement = { outlet: 'filters', mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Filter, id: 'status', title: 'Status' }] };

describe('when a module refines an outlet', () => {
    const document = withRefinement(catalogDocument(), catalog, 'filters', extending);
    it('should keep it with the module\'s navigation, where Screenplay reads it', () => navigationOf(document).modules[0].refinements!.map(refinement => refinement.outlet).should.deep.equal(['toolbar', 'filters']));
    it('should read it back', () => refinementAt(document, catalog, 'filters')!.should.deep.equal(extending));
});

describe('when a feature refines an outlet and then goes back to inheriting it', () => {
    const refined = withRefinement(catalogDocument(), products, 'filters', extending);
    const inheriting = withRefinement(refined, products, 'filters', undefined);
    it('should keep the refinement as a level of its own', () => outletLevelsOf(refined).map(level => level.name).should.deep.equal(['Pricing', 'Products']));
    it('should drop the level when nothing is left', () => outletLevelsOf(inheriting).map(level => level.name).should.deep.equal(['Pricing']));
});

describe('when the module\'s only refinement is removed', () => {
    const document = withRefinement(catalogDocument(), catalog, 'toolbar', undefined);
    it('should drop the module from the navigation', () => navigationOf(document).modules.should.be.empty);
});

describe('when a template\'s outlets are replaced', () => {
    const document = withTemplateOutlets(catalogDocument(), 'ListPage', []);
    it('should leave the template without outlets', () => (document.screenTemplates[0].outlets === undefined).should.be.true);
});
