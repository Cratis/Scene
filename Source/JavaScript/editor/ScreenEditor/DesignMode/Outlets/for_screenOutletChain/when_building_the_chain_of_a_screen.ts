// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletMode } from '@cratis/scene.model';
import { OutletLevelKind } from '@cratis/scene.engine';
import { chainAt, editingLevelsOf, screenOutletChain } from '../../../Outlets/screenOutletChain';
import { catalogDocument, listPage, products, screen } from '../given/productCatalog';

describe('when building the chain of a screen in a feature', () => {
    const { chain, contributors } = screenOutletChain({ document: catalogDocument(), screen });
    it('should go from the application through the layout, template, module and feature to the screen', () =>
        chain.map(level => `${level.kind}:${level.name}`).should.deep.equal(['layout:Application', 'layout:StudioScreen', 'template:ListPage', 'module:Catalog', 'feature:Products', 'screen:Screen']));
    it('should count a feature off the path as a contributor', () => contributors.map(level => level.name).should.contain('Pricing'));
    it('should offer the module, the feature and the screen as levels to edit at', () =>
        editingLevelsOf(chain).map(level => level.name).should.deep.equal(['Catalog', 'Products', 'Screen']));
});

describe('when the screen does not say where it sits', () => {
    const document = catalogDocument();
    const unplaced = { ...document, screens: document.screens.map(candidate => ({ ...candidate, path: undefined })) };
    const { chain } = screenOutletChain({ document: unplaced, screen, path: ['Catalog', 'Products'] });
    it('should take the path the host gives', () => chain.map(level => level.name).should.contain('Products'));
});

describe('when the document does not carry the template', () => {
    const document = { ...catalogDocument(), screenTemplates: [] };
    const { chain } = screenOutletChain({ document, screen, templates: [listPage] });
    it('should take it from the templates the host knows', () => chain.some(level => level.name === 'ListPage' && (level.outlets ?? []).length > 0).should.be.true);
});

describe('when the screen refines an outlet', () => {
    const document = catalogDocument({ outletLevels: [{ kind: OutletLevelKind.Screen, name: screen, refinements: [{ outlet: 'filters', mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Filter, id: 'status', title: 'Status' }] }] }] });
    const { chain, contributors } = screenOutletChain({ document, screen });
    it('should put the refinement on the screen\'s level', () => chain[chain.length - 1].refinements![0].outlet.should.equal('filters'));
    it('should not count the screen as a contributor', () => contributors.some(level => level.name === screen).should.be.false);
});

describe('when the chain is taken at a feature', () => {
    const document = catalogDocument();
    const scoped = chainAt(screenOutletChain({ document, screen }), products);
    it('should end at the feature', () => scoped.chain[scoped.chain.length - 1].name.should.equal('Products'));
});
