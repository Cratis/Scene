// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, PropertyValueType, QueryResultShape, type QueryCandidate } from '@cratis/scene.model';
import { validateBinding } from '@cratis/scene.engine';
import { bindToCandidate, isColumnShown, isQueryBinding, mapColumn, mapParameter, unmapColumn } from '../queryBindingModel';
import { createBindingScope } from '../bindingScopeTypes';
import { PreviewState, previewState } from '../previewState';
import { toSceneCandidates } from '../toSceneCandidates';

const candidate: QueryCandidate = {
    id: 'q-available', name: 'AvailableTools', origin: [{ kind: 'feature', id: 'f', name: 'Maintenance' }, { kind: 'slice', id: 's', name: 'Available tools' }] as QueryCandidate['origin'],
    parameters: [{ name: 'equipmentId', type: 'Guid', required: true }], resultShape: QueryResultShape.Collection,
    resultFields: [{ name: 'id', type: 'Guid', isIdentity: true }, { name: 'name', type: 'string' }],
};
const descriptor = { path: 'query', label: 'Query', group: 'Data', valueType: PropertyValueType.QueryReference, constraints: { resultShapes: [QueryResultShape.Collection] } };
const diagnose = (binding = bindToCandidate(candidate), scope = createBindingScope({ 'route.equipmentId': 'Guid' })) => validateBinding(descriptor, candidate, binding, scope).map(diagnostic => diagnostic.code);

describe('when a table is bound to a query with a required parameter', () => {
    it('should ask for the parameter until it is mapped', () => diagnose().should.deep.equal([DiagnosticCode.MissingRequiredParameter]));
    it('should be fine once it is mapped', () => diagnose(mapParameter(bindToCandidate(candidate), 'equipmentId', 'route.equipmentId')).should.deep.equal([]));
    it('should refuse a source of another type', () =>
        diagnose(mapParameter(bindToCandidate(candidate), 'equipmentId', 'route.name'), createBindingScope({ 'route.name': 'string' })).should.deep.equal([DiagnosticCode.ArgumentTypeMismatch]));
    it('should refuse a source the screen does not have', () =>
        diagnose(mapParameter(bindToCandidate(candidate), 'equipmentId', 'nowhere')).should.deep.equal([DiagnosticCode.UnresolvedArgumentSource]));
});

describe('when mapping result fields to columns', () => {
    const bound = mapColumn(mapColumn(bindToCandidate(candidate), 'name'), 'id');

    it('should show the fields mapped', () => bound.results.map(result => result.field).should.deep.equal(['name', 'id']));
    it('should not map one twice', () => mapColumn(bound, 'name').results.length.should.equal(2));
    it('should report a shown column', () => isColumnShown(bound, candidate.resultFields[1]).should.be.true);
    it('should drop a column', () => unmapColumn(bound, 'name').results.map(result => result.field).should.deep.equal(['id']));
    it('should flag a column the query no longer returns', () => diagnose(mapColumn(bound, 'gone')).should.include(DiagnosticCode.UnknownResultField));
});

describe('when the query is no longer available', () => {
    it('should say the query is missing', () => validateBinding(descriptor, undefined, bindToCandidate(candidate)).map(diagnostic => diagnostic.code).should.deep.equal([DiagnosticCode.MissingQuery]));
});

describe('when a detail view is bound to a collection query', () => {
    it('should refuse the shape', () => {
        const detail = { ...descriptor, constraints: { resultShapes: [QueryResultShape.Single] } };
        validateBinding(detail, candidate, bindToCandidate(candidate)).map(diagnostic => diagnostic.code).should.include(DiagnosticCode.IncompatibleResultShape);
    });
});

describe('when recognising a stored binding', () => {
    it('should accept a binding', () => isQueryBinding(bindToCandidate(candidate)).should.be.true);
    it('should refuse anything else', () => [undefined, null, 'x', {}, { queryId: 1 }].some(isQueryBinding).should.be.false);
});

describe('when handing discovered candidates to Scene', () => {
    it('should pass a well formed candidate through', () => toSceneCandidates([candidate as never]).length.should.equal(1));
    it('should drop one with a result shape Scene does not know', () => toSceneCandidates([{ ...candidate, resultShape: 'stream' } as never]).length.should.equal(0));
});

describe('when previewing a data component', () => {
    const bound = bindToCandidate(candidate);

    it('should say there is no query before one is chosen', () => previewState({ isLoading: false }).should.equal(PreviewState.NoQuery));
    it('should say the query is missing when it is not available', () => previewState({ binding: bound, isLoading: false }).should.equal(PreviewState.MissingQuery));
    it('should show loading while the query runs', () => previewState({ binding: bound, candidate, isLoading: true }).should.equal(PreviewState.Loading));
    it('should show an error when the query fails', () => previewState({ binding: bound, candidate, isLoading: false, error: new Error('x') }).should.equal(PreviewState.Error));
    it('should show empty for no rows', () => previewState({ binding: bound, candidate, isLoading: false, rowCount: 0 }).should.equal(PreviewState.Empty));
    it('should show ready for rows', () => previewState({ binding: bound, candidate, isLoading: false, rowCount: 3 }).should.equal(PreviewState.Ready));
});
