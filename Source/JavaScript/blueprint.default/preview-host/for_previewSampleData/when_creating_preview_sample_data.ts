// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createPreviewSampleData, collectQueryNames, collectTypeNames } from '../previewSampleData';
import { nordicPack, otherPack, ordersApplication } from '../for_ScenePreviewHost/given';

const fields = [{ name: 'customer', type: 'string' }, { name: 'quantity', type: 'number' }];
const shapes = { Orders: { name: 'Orders', fields: [{ name: 'customer', type: 'string' }, { name: 'quantity', type: 'number' }] } };

describe('when creating preview sample data', () => {
    describe('and the document binds queries', () => {
        it('should find every query it names, once', () => collectQueryNames(ordersApplication().screens).should.deep.equal(['Orders', 'OrderList']));
    });

    describe('and the same seed is used twice', () => {
        const first = createPreviewSampleData(ordersApplication(), { packs: [], shapes, seed: 7 });
        const second = createPreviewSampleData(ordersApplication(), { packs: [], shapes, seed: 7 });
        const other = createPreviewSampleData(ordersApplication(), { packs: [], shapes, seed: 8 });

        it('should give the same generated rows', () => first.queryResults.should.deep.equal(second.queryResults));
        it('should give other rows for another seed', () => first.queryResults.should.not.deep.equal(other.queryResults));
        it('should only give rows for the queries that have a shape', () => Object.keys(first.queryResults).should.deep.equal(['Orders']));
    });

    describe('and the profile selects a pack', () => {
        const source = createPreviewSampleData(ordersApplication(), { packs: [nordicPack, otherPack] });

        it('should resolve rows from the active pack', () => (source.rows('PlaceOrder').rows[0].customer as string).should.equal('Fjordline AS'));
        it('should say which rung supplied them', () => [source.rows('PlaceOrder').source, source.rows('PlaceOrder').pack].should.deep.equal(['activePack', 'nordic-smb']));
        it('should fill command fields from the first row', () => source.commandFields('PlaceOrder', fields).map(field => field.initialValue).should.deep.equal(['Fjordline AS', 4]));
    });

    describe('and the session overrides the pack', () => {
        it('should use the pack of the session', () => createPreviewSampleData(ordersApplication(), { packs: [nordicPack, otherPack], sessionActivePack: 'other' }).rows('PlaceOrder').pack!.should.equal('other'));
        it('should use generated data for the empty selection', () => createPreviewSampleData(ordersApplication(), { packs: [nordicPack], sessionActivePack: '' }).rows('PlaceOrder', { name: 'PlaceOrder', fields }).source.should.equal('generated'));
    });

    describe('and a query is named with its namespace', () => {
        it('should find the set by the short name', () => createPreviewSampleData(ordersApplication(), { packs: [nordicPack] }).rows('Sales.Orders.PlaceOrder').rows.length.should.equal(1));
    });

    describe('and a binding names a query', () => {
        const source = createPreviewSampleData(ordersApplication(), { packs: [], shapes, seed: 3 });

        it('should resolve its path against the rows', () => (source.resolveBinding({ query: 'Orders', path: '0.customer' }) as string).should.be.a('string'));
        it('should resolve nothing for an unknown query', () => (source.resolveBinding({ query: 'Ghost', path: '0' }) === undefined).should.equal(true));
        it('should resolve nothing for a binding without a query', () => (source.resolveBinding({ path: 'x' }) === undefined).should.equal(true));
    });

    describe('and no row supplies a field', () => {
        it('should leave the field as it is', () => createPreviewSampleData(ordersApplication(), { packs: [nordicPack] }).commandFields('PlaceOrder', [{ name: 'ghost', type: 'string' }]).should.deep.equal([{ name: 'ghost', type: 'string' }]));
    });

    describe('and a Screenplay screen shows a read model by its type name', () => {
        const screens = [{ name: 'Orders', slotContent: { list: [
            { id: 'data', componentName: 'core:data', properties: { typeName: 'PlaceOrder', isCollection: true, query: 'AllOrders', by: null }, slots: {} },
            { id: 'table', componentName: 'core:table', properties: { typeName: 'PlaceOrder' }, slots: { columns: [] } },
        ] } }];
        const source = createPreviewSampleData({ ...ordersApplication(), screens } as never, { packs: [nordicPack] });

        it('should find the read models the screens show', () => collectTypeNames(screens).typeNames.should.deep.equal(['PlaceOrder']));
        it('should find the query a data element names for a read model', () => collectTypeNames(screens).queries.should.deep.equal({ AllOrders: 'PlaceOrder' }));
        it('should give the read model its rows from the pack', () => (source.queryResults.PlaceOrder as { customer: string }[])[0].customer.should.equal('Fjordline AS'));
        it('should give the query the data element names the same rows', () => (source.queryResults.AllOrders as unknown[]).should.deep.equal(source.queryResults.PlaceOrder as unknown[]));
    });
});
