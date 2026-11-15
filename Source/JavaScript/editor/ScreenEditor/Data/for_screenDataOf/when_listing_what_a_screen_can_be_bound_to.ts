// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryCandidate } from '@cratis/scene.model';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { dataFieldKey, dataFieldLabel, isDataField, screenDataOf } from '../DataField';

const setPrice: StateChangeSlice = {
    id: 'slice-1', name: 'Set price', commandName: 'SetProductPrice', origin: [],
    inputs: [{ name: 'sku', type: 'ProductSku', required: true }, { name: 'price', type: 'Money', required: true }],
};
const other: StateChangeSlice = { id: 'slice-2', name: 'Other', origin: [], inputs: [{ name: 'note', type: 'string', required: false }] };
const query = (id: string, name: string, sliceId: string, fields: string[]): QueryCandidate => ({
    id, name, origin: [{ kind: 'slice', id: sliceId, name: sliceId }], parameters: [], resultShape: 'single', resultFields: fields.map(field => ({ name: field, type: 'string' })),
});
const candidates = [query('q-other', 'AllProducts', 'slice-9', ['name']), query('q-own', 'ProductBySku', 'slice-1', ['name', 'price']), query('q-empty', 'Nothing', 'slice-1', [])];

describe('when listing what a screen can be bound to', () => {
    const data = screenDataOf('slice-1', [other, setPrice], candidates);

    it('should offer the command of the slice by its name', () => data.command!.name.should.equal('SetProductPrice'));
    it('should list the command properties in the order the command declares them', () => data.command!.fields.map(field => field.property).should.deep.equal(['sku', 'price']));
    it('should say each property type', () => data.command!.fields.map(field => field.type).should.deep.equal(['ProductSku', 'Money']));
    it('should list the slice own queries before the rest of the feature', () => data.queries.map(candidate => candidate.name).should.deep.equal(['ProductBySku', 'AllProducts']));
    it('should leave out a query that returns no fields', () => data.queries.some(candidate => candidate.name === 'Nothing').should.be.false);
    it('should name a query field by its query', () => dataFieldLabel(data.queries[0].fields[0]).should.equal('ProductBySku ▸ name'));
    it('should key fields apart', () => new Set([...data.command!.fields, ...data.queries.flatMap(candidate => candidate.fields)].map(dataFieldKey)).size.should.equal(5));
    it('should recognise what it lists as data fields', () => [...data.command!.fields, data.queries[0].fields[0]].every(isDataField).should.be.true);
});

describe('when the slice has no command', () => {
    const data = screenDataOf('slice-3', [setPrice], candidates);

    it('should offer no command', () => (data.command === undefined).should.be.true);
    it('should still offer the queries', () => data.queries.length.should.equal(2));
});

describe('when recognising data fields', () => {
    it('should not take something else for one', () => [isDataField(undefined), isDataField({ source: 'command' }), isDataField({ source: 'other', field: 'x' })].should.deep.equal([false, false, false]));
});
