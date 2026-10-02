// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode } from '@cratis/scene.model';
import { validateBinding } from '../index';
import { binding, candidate, descriptor } from './given/query_fixtures';

const codes = (diagnostics: { code: string }[]) => diagnostics.map(diagnostic => diagnostic.code);

describe('when validating a broken binding', () => {
    it('should report a query that is not among the candidates', () => {
        codes(validateBinding(descriptor, undefined, binding())).should.deep.equal([DiagnosticCode.MissingQuery]);
    });

    it('should report a candidate with a different identity as missing', () => {
        codes(validateBinding(descriptor, { ...candidate, id: 'other' }, binding())).should.deep.equal([DiagnosticCode.MissingQuery]);
    });

    it('should report a result shape the property cannot bind to', () => {
        codes(validateBinding(descriptor, { ...candidate, resultShape: 'single' }, binding())).should.include(DiagnosticCode.IncompatibleResultShape);
    });

    it('should accept any shape when the property does not restrict it', () => {
        validateBinding({ ...descriptor, constraints: undefined }, { ...candidate, resultShape: 'optional-single' }, binding()).should.be.empty;
    });

    it('should report a required parameter nothing supplies', () => {
        codes(validateBinding(descriptor, candidate, binding({ arguments: [] }))).should.deep.equal([DiagnosticCode.MissingRequiredParameter]);
    });

    it('should report an argument for a parameter the query does not have', () => {
        codes(validateBinding(descriptor, candidate, binding({
            arguments: [{ parameter: 'customerId', source: { path: 'a' } }, { parameter: 'nope', source: { path: 'a' } }],
        }))).should.deep.equal([DiagnosticCode.UnknownParameter]);
    });

    it('should report an argument whose type does not fit the parameter', () => {
        codes(validateBinding(descriptor, candidate, binding(), { types: { 'customer.id': 'string' } })).should.deep.equal([DiagnosticCode.ArgumentTypeMismatch]);
    });

    it('should not let a fractional value feed a whole-number parameter', () => {
        const wholeNumberCandidate = { ...candidate, parameters: [{ name: 'customerId', type: 'int', required: true }] };
        codes(validateBinding(descriptor, wholeNumberCandidate, binding(), { types: { 'customer.id': 'decimal' } })).should.deep.equal([DiagnosticCode.ArgumentTypeMismatch]);
    });

    it('should report an argument source that is not in scope', () => {
        codes(validateBinding(descriptor, candidate, binding(), { types: {} })).should.deep.equal([DiagnosticCode.UnresolvedArgumentSource]);
    });

    it('should report a result binding for a field the query does not return', () => {
        codes(validateBinding(descriptor, candidate, binding({ results: [{ target: 'x', field: 'missing' }] }))).should.deep.equal([DiagnosticCode.UnknownResultField]);
    });
});
