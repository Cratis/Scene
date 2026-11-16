// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { UiProfile } from '@cratis/scene.model';
import { profileWithQueryMappings, queryShapeMappingsOf } from '../previewSampleDataMappings';

const data = (query: string, typeName: string) => ({ componentName: 'core:data', properties: { query, typeName, isCollection: true }, slots: {} });
const screens = [
    { name: 'OrderList', slotContent: { list: [data('AllOrderRows', 'OrderRow'), { componentName: 'core:table', properties: { typeName: 'OrderRow' }, slots: {} }] } },
    { name: 'OrderPage', slotContent: { summary: [{ componentName: 'core:section', properties: {}, slots: { body: [data('GetOrderDetail', 'OrderDetail')] } }] } },
    { name: 'Again', slotContent: { list: [data('AllOrderRows', 'OrderRow')] } },
    { name: 'Same', slotContent: { list: [data('OrderRow', 'OrderRow')] } },
];
const profile = (mappings: { shape: string; readModel: string }[]) => ({ name: 'Web', targetPlatform: 'web', packages: [], sampleData: { activePack: 'acme-nordic', mappings, bindings: [] } }) as unknown as UiProfile;

describe('when mapping the pack to the queries a screen binds', () => {
    const found = queryShapeMappingsOf(screens);
    const merged = profileWithQueryMappings(profile([{ shape: 'OrderRow', readModel: 'AllOrderRows' }, { shape: 'Anything', readModel: 'ByHand' }]), screens);
    const bare = profileWithQueryMappings({ name: 'Web', targetPlatform: 'web', packages: [] } as unknown as UiProfile, screens);
    const original = profile([]);
    profileWithQueryMappings(original, screens);

    it('should map the read model of each data element to the query it reads, wherever it sits', () => found.should.deep.equal([{ shape: 'OrderRow', readModel: 'AllOrderRows' }, { shape: 'OrderDetail', readModel: 'GetOrderDetail' }]));
    it('should map each pair once however many screens bind it', () => found.filter(mapping => mapping.readModel === 'AllOrderRows').length.should.equal(1));
    it('should leave out a query that is named like its read model, which the pack already matches by name', () => found.some(mapping => mapping.readModel === 'OrderRow').should.be.false);
    it('should keep the mappings the author made, first', () => merged.sampleData!.mappings[1].should.deep.equal({ shape: 'Anything', readModel: 'ByHand' }));
    it('should add only what the author did not map', () => merged.sampleData!.mappings.map(mapping => mapping.readModel).should.deep.equal(['AllOrderRows', 'ByHand', 'GetOrderDetail']));
    it('should keep the application\'s active pack', () => merged.sampleData!.activePack!.should.equal('acme-nordic'));
    it('should map for a profile that made no sample data choice', () => bare.sampleData!.mappings.length.should.equal(2));
    it('should leave the application\'s profile as it was', () => original.sampleData!.mappings.length.should.equal(0));
    it('should return the same profile when the screens bind nothing', () => { const same = profile([]); (profileWithQueryMappings(same, []) === same).should.be.true; });
});
