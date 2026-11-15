// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterControl } from '@cratis/scene.model';
import { refinementAt } from '../../../Outlets/outletDocument';
import { carryOut, catalogDocument, designOf, theScreen } from '../given/productCatalog';
import type { OutletDesign } from '../createOutletDesign';
import type { SceneDocument } from '@cratis/scene.model';

// A screen that adds an item of the outlet's kind, and binds it as the author does: one choice at a time.
class ScreenAddingTo {
    document: SceneDocument;

    constructor(readonly outlet: string, add: string) {
        this.document = carryOut(catalogDocument(), designOf(catalogDocument(), outlet, theScreen).add(add));
    }

    design(): OutletDesign {
        return designOf(this.document, this.outlet, theScreen);
    }

    bind(actionId: string, value: unknown): void {
        const design = this.design();
        const added = design.items.filter(item => !item.readOnly).slice(-1)[0];
        this.document = carryOut(this.document, design.choice(actionId, added)!.plan(value));
    }
}

describe('when a filter is bound to a parameter of the screen\'s query', () => {
    const filters = new ScreenAddingTo('filters', 'addFilter');
    const offered = filters.design().choice('sets', filters.design().items[1])!.property.descriptor.choices!.map(choice => choice.value);
    filters.bind('sets', 'AllProducts.status');
    filters.bind('control', FilterControl.Choice);
    const item = refinementAt(filters.document, theScreen, 'filters')!.items![0] as unknown as Record<string, unknown>;

    it('should offer the parameters of the queries', () => offered.should.deep.equal(['AllProducts.status', 'AllProducts.search']));
    it('should set the parameter', () => item.sets!.should.deep.equal({ query: 'AllProducts', parameter: 'status' }));
    it('should take the control', () => item.control!.should.equal(FilterControl.Choice));
    it('should say on its chip what it sets', () => filters.design().items[1].chips!.sets.should.equal('AllProducts › status'));
    it('should no longer be flagged', () => filters.design().items[1].unlinked.should.be.false);
});

describe('when a stat takes its value from a field of a single-result query', () => {
    const stats = new ScreenAddingTo('stats', 'addStat');
    const offered = stats.design().choice('valueFrom', stats.design().items[1])!.property.descriptor.choices!.map(choice => choice.value);
    stats.bind('valueFrom', 'ProductStats.drafts');

    it('should offer only the fields of single-result queries', () => offered.should.deep.equal(['ProductStats.drafts', 'ProductStats.onSale']));
    it('should take its value from the field', () => (refinementAt(stats.document, theScreen, 'stats')!.items![0] as unknown as { valueFrom: object }).valueFrom.should.deep.equal({ query: 'ProductStats', field: 'drafts' }));
});

describe('when a tab is added and shows another screen', () => {
    const tabs = new ScreenAddingTo('detailTabs', 'addTab');
    const first = (refinementAt(tabs.document, theScreen, 'detailTabs')!.items![0] as unknown as { shows: string }).shows;
    tabs.bind('shows', 'ProductPricing');

    it('should start out showing a screen, which a tab needs', () => first.should.equal('ProductPricing'));
    it('should show the chosen screen', () => tabs.design().items[1].chips!.shows.should.equal('Product pricing'));
});

describe('when a navigation item is linked to a feature', () => {
    const sections = new ScreenAddingTo('sections', 'addItem');
    sections.bind('target', { module: 'Catalog', feature: 'Archived' });
    it('should lead there', () => (refinementAt(sections.document, theScreen, 'sections')!.items![0] as unknown as { target: object }).target.should.deep.equal({ module: 'Catalog', feature: 'Archived' }));
});

describe('when a button is told where it opens', () => {
    const toolbar = new ScreenAddingTo('toolbar', 'addButton');
    toolbar.bind('opens', 'drawer');
    const opensDrawer = (refinementAt(toolbar.document, theScreen, 'toolbar')!.items![0] as unknown as { opens: string }).opens;
    toolbar.bind('opens', 'automatic');
    const automatic = (refinementAt(toolbar.document, theScreen, 'toolbar')!.items![0] as unknown as { opens?: string }).opens;

    it('should open there', () => opensDrawer.should.equal('drawer'));
    it('should leave it out when automatic, the default', () => (automatic === undefined).should.be.true);
});

describe('when an inherited item is asked for a binding', () => {
    it('should offer none', () => {
        const design = designOf(catalogDocument(), 'filters', theScreen);
        (design.choice('sets', design.items[0]) === undefined).should.be.true;
    });
});
