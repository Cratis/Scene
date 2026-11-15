// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, QueryResultShape, type QueryCandidate } from '@cratis/scene.model';
import { bindToCandidate, mapColumn, mapParameter } from '../queryBindingModel';
import { createBindingScope } from '../bindingScopeTypes';
import { settleBinding } from '../settleBinding';

const candidate = (parameters: QueryCandidate['parameters']): QueryCandidate => ({
    id: 'q', name: 'AvailableTools', origin: [], parameters, resultShape: QueryResultShape.Collection, resultFields: [{ name: 'name', type: 'string' }],
});
const descriptor = { path: 'query', label: 'Query', group: 'Data', valueType: PropertyValueType.QueryReference };
const scope = createBindingScope({ 'route.equipmentId': 'Guid' });

describe('when settling a binding with a required parameter nothing feeds', () => {
    const settled = settleBinding(descriptor, candidate([{ name: 'equipmentId', type: 'Guid', required: true }]), bindToCandidate(candidate([{ name: 'equipmentId', type: 'Guid', required: true }])), scope);

    it('should hold it as a draft', () => settled.isStorable.should.be.false);
    it('should say what is missing', () => settled.diagnostics.length.should.equal(1));
});

describe('when settling a binding once its parameter is mapped', () => {
    const parameters = [{ name: 'equipmentId', type: 'Guid', required: true }];
    const settled = settleBinding(descriptor, candidate(parameters), mapParameter(bindToCandidate(candidate(parameters)), 'equipmentId', 'route.equipmentId'), scope);

    it('should be storable', () => settled.isStorable.should.be.true);
    it('should have nothing to say', () => settled.diagnostics.should.deep.equal([]));
});

describe('when settling a binding to a query with no required parameters', () => {
    it('should be storable straight away', () => settleBinding(descriptor, candidate([]), bindToCandidate(candidate([])), scope).isStorable.should.be.true);
});

describe('when settling a binding with a column the query does not return', () => {
    it('should hold it as a draft', () => settleBinding(descriptor, candidate([]), mapColumn(bindToCandidate(candidate([])), 'gone'), scope).isStorable.should.be.false);
});

describe('when the query is not available', () => {
    it('should hold it as a draft and say so', () => settleBinding(descriptor, undefined, bindToCandidate(candidate([])), scope).isStorable.should.be.false);
});
