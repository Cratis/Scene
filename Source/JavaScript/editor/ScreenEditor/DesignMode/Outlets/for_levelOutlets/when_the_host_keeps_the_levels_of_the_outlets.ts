// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletMode, type OutletRefinement } from '@cratis/scene.model';
import { OutletLevelKind } from '@cratis/scene.engine';
import { navigationOf } from '../../Navigation/navigationDocument';
import { openSubject } from '../../../Host/openSubject';
import { withLevelOutlets, withoutLevelOutlets, type LevelRefinements } from '../levelOutlets';
import { outletLevelsOf, refinementAt } from '../../../Outlets/outletDocument';
import { savedScreenDocument } from '../savedScreenDocument';
import { catalog, catalogDocument, products, screen } from '../given/productCatalog';

const filters: OutletRefinement = { outlet: 'filters', mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Filter, id: 'status', title: 'Status' }] };
const stats: OutletRefinement = { outlet: 'stats', mode: OutletMode.Overrides, items: [{ kind: OutletItemKind.Stat, id: 'late', title: 'Late' }] };
const stored: readonly LevelRefinements[] = [
    { kind: OutletLevelKind.Feature, name: 'Products', refinements: [filters] },
    { kind: OutletLevelKind.Module, name: 'Catalog', refinements: [stats] },
];

describe('when the levels the host keeps are put in a document it opens', () => {
    const document = withLevelOutlets(catalogDocument(), stored);
    it('should refine the outlet of the feature', () => refinementAt(document, products, 'filters')!.should.deep.equal(filters));
    it('should refine the outlet of the module', () => refinementAt(document, catalog, 'stats')!.should.deep.equal(stats));
    it('should keep what the document still says about another outlet of the same module', () => refinementAt(document, catalog, 'toolbar')!.mode!.should.equal(OutletMode.Extends));
});

describe('when the levels the host keeps are taken out of a document it saves', () => {
    const { document, levels } = withoutLevelOutlets(withLevelOutlets(catalogDocument(), stored));
    it('should hand back the feature as its own level', () => levels.find(level => level.kind === OutletLevelKind.Feature && level.name === 'Products')!.refinements.should.deep.equal([filters]));
    it('should hand back the module with everything it refined, what the document held before included', () => levels.find(level => level.kind === OutletLevelKind.Module)!.refinements.map(refinement => refinement.outlet).sort().should.deep.equal(['stats', 'toolbar']));
    it('should leave the document with no level of a feature that refines outlets', () => outletLevelsOf(document).filter(level => level.kind === OutletLevelKind.Feature && (level.refinements ?? []).length > 0).should.be.empty);
    it('should leave the document with no refinement of a module', () => navigationOf(document).modules.some(module => module.refinements).should.be.false);
    it('should keep what the feature contributes to an outlet, which is not a refinement', () => outletLevelsOf(document).some(level => level.name === 'Pricing' && (level.contributions ?? []).length > 0).should.be.true);
});

describe('when the screen is saved', () => {
    const kept = savedScreenDocument(withLevelOutlets(catalogDocument(), stored), screen, true);
    const unkept = savedScreenDocument(withLevelOutlets(catalogDocument(), stored), screen, false);
    it('should hand the levels back when the host keeps them', () => kept.levelOutlets!.length.should.equal(2));
    it('should not leave them in the document of a host that keeps them', () => navigationOf(kept.document).modules.some(module => module.refinements).should.be.false);
    it('should leave them in the document, and hand back nothing, when the host does not keep them', () => {
        (unkept.levelOutlets === undefined).should.be.true;
        refinementAt(unkept.document, products, 'filters')!.should.deep.equal(filters);
    });
});

describe('when a screen is opened for a host that keeps the levels', () => {
    const opened = openSubject({ document: catalogDocument() } as never, undefined, [], stored);
    it('should open it with the levels in the document', () => {
        if (!opened.opened) throw new Error('not opened');
        refinementAt(opened.subject.document, products, 'filters')!.should.deep.equal(filters);
    });
});
