// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletKind, OutletMode, type ScreenTemplate } from '@cratis/scene.model';
import { OutletLevelKind, createDescriptorCatalog } from '@cratis/scene.engine';
import { defaultOutletStrings } from '../../ScreenEditor/DesignMode/Outlets/OutletStrings';
import type { LevelRefinements } from '../../ScreenEditor/DesignMode/Outlets/levelOutlets';
import { listPage } from '../../ScreenEditor/DesignMode/Outlets/given/productCatalog';
import { exposesKind, levelSurfaceModel, levelsWithRefinement, outletElementsOf, refinementAfter } from '../levelSurfaceModel';

const levels: LevelRefinements[] = [
    { kind: OutletLevelKind.Module, name: 'Catalog', refinements: [{ outlet: 'toolbar', mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Button, id: 'addProduct', title: 'Add product', slice: 'AddProduct' }] }] },
    { kind: OutletLevelKind.Feature, name: 'Products', refinements: [] },
];

const modelOf = (template: string, templates: readonly ScreenTemplate[], held: readonly LevelRefinements[] = levels) => levelSurfaceModel({
    template, levels: held, catalog: createDescriptorCatalog([]), templates, layouts: [], queries: [], slices: [], screens: [], strings: defaultOutletStrings, newId: () => 'new-item',
});

const labelsOf = (model: ReturnType<typeof modelOf>, outlet: string) => model.outlets.design(outlet)?.items.map(item => item.label);

describe('when a feature sees the outlets of its template', () => {
    const model = modelOf('ListPage', [listPage]);

    it('should expose every outlet the template declares, in its order', () => model.exposed.map(outlet => outlet.name).should.deep.equal(['toolbar', 'rowActions', 'filters', 'stats', 'detailTabs', 'sections']));
    it('should say the kind of each', () => model.exposed.map(outlet => outlet.kind).should.deep.equal([OutletKind.Actions, OutletKind.Actions, OutletKind.Filters, OutletKind.Stats, OutletKind.Tabs, OutletKind.Navigation]));
    it('should see the level it is the edited one', () => model.level?.should.deep.equal({ kind: OutletLevelKind.Feature, name: 'Products' }));
    it('should see what the module above adds to the outlet', () => labelsOf(model, 'toolbar')!.should.deep.equal(['Refresh', 'Export', 'Add product']));
    it('should say the template exposes an outlet of actions', () => exposesKind(model.exposed, OutletKind.Actions).should.be.true);
});

describe('when a feature hooks a new action into an outlet', () => {
    const model = modelOf('ListPage', [listPage]);
    const design = model.outlets.design('toolbar')!;
    const plan = design.addItem({ kind: OutletItemKind.Button, id: 'archive', title: 'Archive', slice: 'ArchiveProduct' } as never);
    const refinement = refinementAfter(model, plan as never, 'toolbar');
    const after = levelsWithRefinement(levels, model.level!, 'toolbar', refinement);

    it('should extend the outlet at the feature, since it inherits the module\'s', () => refinement!.mode!.should.equal(OutletMode.Extends));
    it('should carry the new action as the feature\'s own', () => refinement?.items?.map(item => item.id).should.deep.equal(['archive']));
    it('should leave the module as it was', () => after[0].should.deep.equal(levels[0]));
    it('should put the refinement on the feature', () => after[1].refinements.map(entry => entry.outlet).should.deep.equal(['toolbar']));
    it('should show the new action after what the level inherits once it is kept', () => labelsOf(modelOf('ListPage', [listPage], after), 'toolbar')!.should.deep.equal(['Refresh', 'Export', 'Add product', 'Archive']));
});

describe('when a feature goes back to inheriting an outlet', () => {
    const held = levelsWithRefinement(levels, { kind: OutletLevelKind.Feature, name: 'Products' }, 'toolbar', { outlet: 'toolbar', mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Button, id: 'archive', title: 'Archive' } as never] });
    const without = levelsWithRefinement(held, { kind: OutletLevelKind.Feature, name: 'Products' }, 'toolbar', undefined);
    it('should keep the module\'s refinement', () => without[0].refinements.length.should.equal(1));
    it('should hold nothing of the outlet at the feature', () => without[1].refinements.should.deep.equal([]));
});

describe('when the template exposes no outlet', () => {
    const plain: ScreenTemplate = { name: 'Plain', slots: [{ name: 'content' }] };
    const model = modelOf('Plain', [plain]);
    it('should expose nothing', () => model.exposed.should.deep.equal([]));
    it('should say there is no outlet of actions', () => exposesKind(model.exposed, OutletKind.Actions).should.be.false);
});

describe('when the template is not known', () => {
    const model = modelOf('Missing', [listPage]);
    it('should expose nothing', () => model.exposed.should.deep.equal([]));
});

describe('when finding where the template draws its outlets', () => {
    const element = { id: 'page', children: [{ id: 'bar', componentName: 'core:outletItems', properties: { name: 'toolbar' }, children: [] }, { id: 'search', componentName: 'core:outletItems', properties: { name: 'filters' }, children: [] }, { id: 'other', componentName: 'core:text', properties: { name: 'x' }, children: [] }] };
    const found = outletElementsOf(element as never);
    it('should find each outlet by its name', () => [...found].should.deep.equal([['toolbar', 'bar'], ['filters', 'search']]));
    it('should find nothing when nothing is drawn', () => outletElementsOf(undefined).size.should.equal(0));
});
