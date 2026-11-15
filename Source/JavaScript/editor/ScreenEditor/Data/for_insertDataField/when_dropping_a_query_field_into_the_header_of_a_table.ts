// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryBinding, QueryCandidate } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { insertDataField } from '../insertDataField';
import { insertionFor } from './given';

const allProducts: QueryCandidate = {
    id: 'q-all', name: 'AllProducts', origin: [], parameters: [], resultShape: 'collection',
    resultFields: [{ name: 'name', type: 'string' }, { name: 'status', type: 'string' }, { name: 'sku', type: 'string' }],
};
const binding: QueryBinding = { queryId: 'q-all', query: 'AllProducts', arguments: [], results: [{ target: 'name', field: 'name' }, { target: 'status', field: 'status' }] };
const table = () => createExternalComponent('products-table', 'AllProducts', 'Cratis.Components:dataTable', { query: binding });
const field = (name: string) => ({ source: 'query' as const, queryId: 'q-all', query: 'AllProducts', field: name, type: 'string' });
const columnsAfter = (value: unknown) => (value as { value: QueryBinding }).value.results.map(result => result.field);

describe('when dropping a query field into the header of a table', () => {
    const { insertion, recorded } = insertionFor([table()], [], undefined, [allProducts]);
    insertDataField(field('sku'), { parentId: 'screen-root', index: 0, over: { elementId: 'products-table', column: 1 } }, insertion);

    it('should place the column at the position under the pointer', () => columnsAfter(recorded.applied[0].edit).should.deep.equal(['name', 'sku', 'status']));
    it('should say where it was placed', () => recorded.applied[0].label.should.equal('Place sku at column 2'));
    it('should make no new table', () => recorded.inserted.length.should.equal(0));
});

describe('when dropping a column the table shows into another place in its header', () => {
    const { insertion, recorded } = insertionFor([table()], [], undefined, [allProducts]);
    insertDataField(field('status'), { parentId: 'screen-root', index: 0, over: { elementId: 'products-table', column: 0 } }, insertion);

    it('should move the column', () => columnsAfter(recorded.applied[0].edit).should.deep.equal(['status', 'name']));
});

describe('when dropping a query field over a table that draws no headers', () => {
    const { insertion, recorded } = insertionFor([table()], [], undefined, [allProducts]);
    insertDataField(field('sku'), { parentId: 'screen-root', index: 0, over: { elementId: 'products-table' } }, insertion);

    it('should add the column last', () => columnsAfter(recorded.applied[0].edit).should.deep.equal(['name', 'status', 'sku']));
});
