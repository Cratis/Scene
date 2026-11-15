// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryCandidate, SceneElement } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { removeQueryColumn } from '../insertDataField';
import { insertionFor } from './given';

const allProducts: QueryCandidate = { id: 'q-all', name: 'AllProducts', origin: [], parameters: [], resultShape: 'collection', resultFields: [{ name: 'name', type: 'string' }] };

describe('when taking a column off the table over a query', () => {
    const table = createExternalComponent('products', 'Products', 'Cratis.Components:dataTable', { query: { queryId: 'q-all', query: 'AllProducts', arguments: [], results: [{ target: 'name', field: 'name' }, { target: 'price', field: 'price' }] } }) as unknown as SceneElement;
    const { insertion, recorded } = insertionFor([table], [], undefined, [allProducts]);
    removeQueryColumn({ source: 'query', queryId: 'q-all', query: 'AllProducts', field: 'price', type: 'Money' }, insertion);

    it('should leave the other columns', () => (recorded.applied[0].edit as unknown as { value: { results: { field: string }[] } }).value.results.map(result => result.field).should.deep.equal(['name']));
});

describe('when taking off a column the table does not show', () => {
    const table = createExternalComponent('products', 'Products', 'Cratis.Components:dataTable', { query: { queryId: 'q-all', query: 'AllProducts', arguments: [], results: [] } }) as unknown as SceneElement;
    const { insertion, recorded } = insertionFor([table], [], undefined, [allProducts]);
    removeQueryColumn({ source: 'query', queryId: 'q-all', query: 'AllProducts', field: 'price', type: 'Money' }, insertion);

    it('should change nothing', () => recorded.applied.length.should.equal(0));
});
