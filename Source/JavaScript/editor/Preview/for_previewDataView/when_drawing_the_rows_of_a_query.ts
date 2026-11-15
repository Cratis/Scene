// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cellText, previewDataSourcesOf, previewFieldsOf, previewRowDispatcher, queryOfTypeName, resolveInRow, rowsOfQueryResult } from '../previewDataView';

const data = (query: string, typeName: string, isCollection: boolean) => ({ componentName: 'core:data', properties: { query, typeName, isCollection }, slots: {} });
const screens = [
    { name: 'OrderList', slotContent: { list: [data('AllOrderRows', 'OrderRow', true)] } },
    { name: 'OrderPage', slotContent: { summary: [{ componentName: 'core:section', properties: {}, slots: { body: [data('GetOrderDetail', 'OrderDetail', false), data('AllOrderDetails', 'OrderDetail', true)] } }] } },
    { name: 'Single', slotContent: { summary: [data('GetOnlyOne', 'OnlyOne', false)] } },
];

describe('when drawing the rows of a query', () => {
    const sources = previewDataSourcesOf(screens);
    const table = { slots: { columns: [{ properties: { property: 'orderId', label: 'Order' } }, { properties: { property: 'status' } }, { properties: { label: 'No property' } }] } };

    it('should find every data element wherever it sits', () => sources.map(source => source.query).should.deep.equal(['AllOrderRows', 'GetOrderDetail', 'AllOrderDetails', 'GetOnlyOne']));
    it('should read a table from the collection query of its read model', () => queryOfTypeName(sources, 'OrderDetail', true)!.should.equal('AllOrderDetails'));
    it('should read a summary from the single record query of its read model', () => queryOfTypeName(sources, 'OrderDetail', false)!.should.equal('GetOrderDetail'));
    it('should read from the only query there is when it is of the other kind', () => queryOfTypeName(sources, 'OnlyOne', true)!.should.equal('GetOnlyOne'));
    it('should read nothing for a read model no data element yields', () => (queryOfTypeName(sources, 'Unknown', true) === undefined).should.be.true);
    it('should take the rows of a collection as they are', () => rowsOfQueryResult([{ a: 1 }, { a: 2 }, 3]).should.deep.equal([{ a: 1 }, { a: 2 }]));
    it('should take a single record as one row', () => rowsOfQueryResult({ a: 1 }).should.deep.equal([{ a: 1 }]));
    it('should take no rows from a query without sample data', () => rowsOfQueryResult(undefined).should.deep.equal([]));
    it('should name a column by its label, or by its property when it has none', () => previewFieldsOf(table, 'columns').should.deep.equal([{ property: 'orderId', label: 'Order' }, { property: 'status', label: 'status' }]));
    it('should find no fields in a slot that is not there', () => previewFieldsOf(table, 'fields').should.deep.equal([]));
    it('should write a flag as yes or no', () => `${cellText(true)}/${cellText(false)}`.should.equal('Yes/No'));
    it('should write nothing for a missing value', () => `${cellText(undefined)}${cellText(null)}`.should.equal(''));
    it('should write a number and a text as they are', () => `${cellText(749)} ${cellText('Oslo')}`.should.equal('749 Oslo'));
    it('should write what is nested as its JSON', () => cellText({ city: 'Oslo' }).should.equal('{"city":"Oslo"}'));
});

describe('when a row of a table is worked with', () => {
    const row = { orderId: '0e7d9b1a', customer: { email: 'ada@example.com' } };
    const resolve = resolveInRow(row, binding => `outer:${binding.path}`);

    it('should resolve the field of the row for an item path', () => (resolve({ path: 'item.orderId' }) as string).should.equal('0e7d9b1a'));
    it('should resolve a nested field of the row', () => (resolve({ path: 'item.customer.email' }) as string).should.equal('ada@example.com'));
    it('should resolve nothing for a field the row does not have', () => (resolve({ path: 'item.missing.deeper' }) === undefined).should.be.true);
    it('should leave everything else to the host', () => (resolve({ path: 'data.orderId' }) as string).should.equal('outer:data.orderId'));
});

describe('when a row of a table starts an action in the preview', () => {
    const gone: { screen: string }[] = [];
    const dispatcher = previewRowDispatcher({ navigate: destination => gone.push(destination) });
    dispatcher.navigate('OrderPage');
    const outside = previewRowDispatcher(undefined);

    it('should go to the screen the row names', () => gone.should.deep.equal([{ screen: 'OrderPage' }]));
    it('should go nowhere outside a preview', () => { outside.navigate('OrderPage'); gone.length.should.equal(1); });
    it('should report a command as done, since nothing is sent from a preview', async () => (await dispatcher.executeCommand()).isSuccess.should.be.true);
    it('should leave a dialog unconfirmed', async () => (await dispatcher.openDialog()).isConfirmed.should.be.false);
});
