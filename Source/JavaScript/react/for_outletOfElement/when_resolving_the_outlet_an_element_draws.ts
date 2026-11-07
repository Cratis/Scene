// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletLevelKind } from '@cratis/scene.engine';
import { OutletItemKind, OutletKind } from '@cratis/scene.model';
import { outletOfElement } from '../outlets/outletOfElement';

const refresh = { kind: OutletItemKind.Button, id: 'refresh', title: 'Refresh', builtIn: 'refresh' };
const add = { kind: OutletItemKind.Button, id: 'add', title: 'Add', slice: 'Catalog.Products.AddProduct' };
const chain = [
    { kind: OutletLevelKind.Template, name: 'Catalog', outlets: [{ name: 'toolbar', kind: OutletKind.Actions, defaults: [refresh] }] },
    { kind: OutletLevelKind.Feature, name: 'Products', refinements: [{ outlet: 'toolbar', items: [add] }] },
] as never;

describe('when resolving the outlet an element draws', () => {
    describe('and the page declares it', () => {
        const outlet = outletOfElement('toolbar', { name: 'toolbar', kind: 'actions', items: [] }, { chain })!;

        it('should draw what the chain resolves', () => outlet.items.map(entry => entry.item.id).should.deep.equal(['refresh', 'add']));
        it('should say where the items come from', () => outlet.summary.should.equal('Catalog + Products'));
    });

    describe('and the page does not declare it', () => {
        const outlet = outletOfElement('toolbar', { name: 'orders', kind: 'actions', items: [add] }, { chain })!;

        it('should draw the items the element carries', () => outlet.items.map(entry => entry.item.id).should.deep.equal(['add']));
        it('should take the kind the element declares', () => outlet.kind!.should.equal(OutletKind.Actions));
    });

    describe('and the element names no kind the page could not resolve', () => {
        it('should resolve nothing', () => (outletOfElement('x', { name: 'orders' }, undefined) === undefined).should.be.true);
    });
});
