// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryBinding } from '@cratis/scene.model';
import { placeColumn } from '../queryBindingModel';

const binding: QueryBinding = { queryId: 'q', query: 'AllProducts', arguments: [], results: [{ target: 'name', field: 'name' }, { target: 'status', field: 'status' }, { target: 'price', field: 'price' }] };
const fields = (value: QueryBinding) => value.results.map(result => result.field);

describe('when placing a column of a table', () => {
    it('should put a new column at the position', () => fields(placeColumn(binding, 'sku', 1)).should.deep.equal(['name', 'sku', 'status', 'price']));
    it('should put a new column first', () => fields(placeColumn(binding, 'sku', 0)).should.deep.equal(['sku', 'name', 'status', 'price']));
    it('should put a new column last without a position', () => fields(placeColumn(binding, 'sku', undefined)).should.deep.equal(['name', 'status', 'price', 'sku']));
    it('should put a column dropped beyond the last one last', () => fields(placeColumn(binding, 'sku', 9)).should.deep.equal(['name', 'status', 'price', 'sku']));
    it('should move a column that is shown already to a position before it', () => fields(placeColumn(binding, 'price', 0)).should.deep.equal(['price', 'name', 'status']));
    it('should move a column that is shown already to a position after it', () => fields(placeColumn(binding, 'name', 3)).should.deep.equal(['status', 'price', 'name']));
    it('should leave a column that is shown already where it is without a position', () => fields(placeColumn(binding, 'status', undefined)).should.deep.equal(['name', 'status', 'price']));
    it('should keep the target the column was shown as', () => placeColumn({ ...binding, results: [{ target: 'Title', field: 'name' }] }, 'name', 0).results[0].target.should.equal('Title'));
});
