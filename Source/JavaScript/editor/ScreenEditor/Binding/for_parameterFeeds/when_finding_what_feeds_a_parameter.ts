// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type Slot } from '@cratis/scene.model';
import type { QueryBinding } from '@cratis/scene.model';
import { filterFor, filtersSetting, filtersSettingQuery, mappedRouteOf, routedValuesOf, withRouteSource, type ListedItem, type RoutedValue } from '../parameterFeeds';

const item = (id: string, label: string, values: Record<string, unknown>): ListedItem => ({ id, label, values });
const items = [
    item('search', 'Search', { kind: 'filter', sets: { query: 'AllProducts', parameter: 'search' } }),
    item('status', 'Status', { kind: 'filter', sets: { query: 'AllProducts', parameter: 'status' } }),
    item('other', 'Other', { kind: 'filter', sets: { query: 'AllOrders', parameter: 'search' } }),
    item('loose', 'Loose', { kind: 'filter' }),
    item('help', 'Help', { kind: 'button', sets: { query: 'AllProducts', parameter: 'search' } }),
];

describe('when finding what feeds a parameter of a query', () => {
    it('should find the filters that set it', () => filtersSetting('filters', items, 'AllProducts', 'search').map(feed => feed.id).should.deep.equal(['search']));
    it('should name the outlet the filter is in', () => filtersSetting('detailFilters', items, 'AllProducts', 'status')[0].outlet.should.equal('detailFilters'));
    it('should not take a filter of another query', () => filtersSetting('filters', items, 'AllProducts', 'category').should.deep.equal([]));
    it('should not take an item that is not a filter', () => filtersSetting('filters', items, 'AllProducts', 'search').some(feed => feed.id === 'help').should.be.false);
    it('should make a filter titled after the parameter', () => filterFor('AllProducts', 'status', 'f').should.deep.equal({ kind: OutletItemKind.Filter, id: 'f', title: 'Status', sets: { query: 'AllProducts', parameter: 'status' } }));
});

describe('when finding the filters a stat follows', () => {
    it('should take every filter that sets a parameter of the query', () => filtersSettingQuery([...items, item('x', 'X', { kind: 'filter', sets: { query: 'AllProducts', parameter: 'category' } })], 'AllProducts').map(found => found.id).should.deep.equal(['search', 'status', 'x']));
    it('should take none when no filter sets one', () => filtersSettingQuery(items, 'ProductStats').should.deep.equal([]));
});

describe('when listing the route values of the slots of a template', () => {
    const slots: Slot[] = [{ name: 'content' }, { name: 'detail', routed: true, routedBy: ['sku'] }, { name: 'aside', routedBy: ['ignored'] }];

    it('should list the values of a routed slot', () => routedValuesOf(slots).should.deep.equal([{ slot: 'detail', parameter: 'sku', path: 'route.sku' }]));
});

describe('when mapping a parameter to a route value', () => {
    const sku: RoutedValue = { slot: 'detail', parameter: 'sku', path: 'route.sku' };
    const binding: QueryBinding = { queryId: 'q', query: 'ProductBySku', arguments: [{ parameter: 'other', source: { path: 'filters.other' } }], results: [] };
    const mapped = withRouteSource(binding, 'bySku', sku);

    it('should map the parameter to the path of the value', () => mapped.arguments.find(argument => argument.parameter === 'bySku')!.source.path.should.equal('route.sku'));
    it('should keep the mappings of the other parameters', () => mapped.arguments.find(argument => argument.parameter === 'other')!.source.path.should.equal('filters.other'));
    it('should know the value the parameter is mapped to', () => mappedRouteOf(mapped, 'bySku', [sku])!.should.equal(sku));
    it('should not take another mapping for a route value', () => (mappedRouteOf(mapped, 'other', [sku]) === undefined).should.be.true);
    it('should take the mapping off when no value is given', () => withRouteSource(mapped, 'bySku', undefined).arguments.some(argument => argument.parameter === 'bySku').should.be.false);
});
