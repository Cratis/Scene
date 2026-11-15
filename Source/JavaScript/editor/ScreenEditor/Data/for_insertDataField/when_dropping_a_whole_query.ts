// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryCandidate, SceneElement } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { insertDataField } from '../insertDataField';
import { insertionFor } from './given';

const allProducts: QueryCandidate = {
    id: 'q-all', name: 'AllProducts', origin: [], parameters: [], resultShape: 'collection',
    resultFields: [{ name: 'sku', type: 'ProductSku', isIdentity: true }, { name: 'name', type: 'string' }, { name: 'price', type: 'Money' }, { name: 'status', type: 'string' }, { name: 'category', type: 'string' }, { name: 'stock', type: 'int' }],
};
const productBySku: QueryCandidate = {
    id: 'q-one', name: 'ProductBySku', origin: [], parameters: [], resultShape: 'single',
    resultFields: [{ name: 'sku', type: 'ProductSku', isIdentity: true }, { name: 'name', type: 'string' }, { name: 'price', type: 'Money' }],
};
type Table = { componentName: string; properties: { query: { queryId: string; results: { field: string }[] }; dataKey?: string } };

describe('when dropping a list query', () => {
    const { insertion, recorded } = insertionFor([], [], undefined, [allProducts]);
    const refusal = insertDataField({ source: 'queryResult', queryId: 'q-all', query: 'AllProducts', shape: 'collection' }, { parentId: 'screen-root', index: 0 }, insertion);
    const table = recorded.inserted[0].element as unknown as Table;

    it('should not refuse', () => (refusal === undefined).should.be.true);
    it('should make a table', () => table.componentName.should.equal('Cratis.Components:dataTable'));
    it('should bind the table to the query', () => table.properties.query.queryId.should.equal('q-all'));
    it('should show the first fields that are not the key as columns', () => table.properties.query.results.map(result => result.field).should.deep.equal(['name', 'price', 'status', 'category']));
    it('should identify rows by the key', () => table.properties.dataKey!.should.equal('sku'));
});

describe('when dropping a query that returns one result', () => {
    const { insertion, recorded } = insertionFor([], [], undefined, [productBySku]);
    insertDataField({ source: 'queryResult', queryId: 'q-one', query: 'ProductBySku', shape: 'single' }, { parentId: 'screen-root', index: 0 }, insertion);
    const summary = recorded.inserted[0].element as unknown as { children: { componentName: string; properties: { resultField: string } }[] };

    it('should make one summary of single results', () => summary.children.every(child => child.componentName === 'Cratis.Components:singleResult').should.be.true);
    it('should show each field that is not the key', () => summary.children.map(child => child.properties.resultField).should.deep.equal(['name', 'price']));
});

describe('when the first table the profile offers cannot be bound to a query', () => {
    const { insertion, recorded } = insertionFor([], [], { PrimeReact: ['dataTable'], 'Cratis.Components': ['dataTable'] }, [allProducts]);
    insertDataField({ source: 'queryResult', queryId: 'q-all', query: 'AllProducts', shape: 'collection' }, { parentId: 'screen-root', index: 0 }, { ...insertion, bindsQuery: name => name === 'Cratis.Components:dataTable' });

    it('should make the table that can', () => (recorded.inserted[0].element as unknown as Table).componentName.should.equal('Cratis.Components:dataTable'));
});

describe('when no table the profile offers can be bound to a query', () => {
    const { insertion } = insertionFor([], [], { PrimeReact: ['dataTable'] }, [allProducts]);

    it('should refuse a list query', () => insertDataField({ source: 'queryResult', queryId: 'q-all', query: 'AllProducts', shape: 'collection' }, { parentId: 'screen-root', index: 0 }, { ...insertion, bindsQuery: () => false })!.should.equal('noTable'));
});

describe('when the profile offers no table', () => {
    const { insertion } = insertionFor([], [], { 'Cratis.Components': ['singleResult'] }, [allProducts]);

    it('should refuse a list query', () => insertDataField({ source: 'queryResult', queryId: 'q-all', query: 'AllProducts', shape: 'collection' }, { parentId: 'screen-root', index: 0 }, insertion)!.should.equal('noTable'));
});

describe('when dropping a field of a list on the table over that list', () => {
    const table = createExternalComponent('products', 'Products', 'Cratis.Components:dataTable', { query: { queryId: 'q-all', query: 'AllProducts', arguments: [], results: [{ target: 'name', field: 'name' }] } }) as unknown as SceneElement;
    const { insertion, recorded } = insertionFor([table], [], undefined, [allProducts]);
    insertDataField({ source: 'query', queryId: 'q-all', query: 'AllProducts', field: 'price', type: 'Money' }, { parentId: 'products', index: undefined }, insertion);
    const edit = recorded.applied[0].edit as unknown as { path: string; value: { results: { field: string }[] } };

    it('should add a column to that table', () => edit.value.results.map(result => result.field).should.deep.equal(['name', 'price']));
    it('should change the query of the table', () => edit.path.should.equal('query'));
    it('should not add another element', () => recorded.inserted.length.should.equal(0));
});

describe('when dropping a field of a list on a screen whose table is over that list', () => {
    const table = createExternalComponent('products', 'Products', 'Cratis.Components:dataTable', { query: { queryId: 'q-all', query: 'AllProducts', arguments: [], results: [] } }) as unknown as SceneElement;
    const { insertion, recorded } = insertionFor([table], [], undefined, [allProducts]);
    insertDataField({ source: 'query', queryId: 'q-all', query: 'AllProducts', field: 'status', type: 'string' }, { parentId: 'screen-root', index: 0 }, insertion);

    it('should still add the column to that table', () => (recorded.applied[0].edit as unknown as { value: { results: { field: string }[] } }).value.results.map(result => result.field).should.deep.equal(['status']));
});

describe('when dropping a field of a list on a screen without a table', () => {
    const { insertion, recorded } = insertionFor([], [], undefined, [allProducts]);
    insertDataField({ source: 'query', queryId: 'q-all', query: 'AllProducts', field: 'status', type: 'string' }, { parentId: 'screen-root', index: 0 }, insertion);

    it('should make a table with that column', () => (recorded.inserted[0].element as unknown as Table).properties.query.results.map(result => result.field).should.deep.equal(['status']));
});
