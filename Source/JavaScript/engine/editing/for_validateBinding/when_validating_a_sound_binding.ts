// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateBinding } from '../index';
import { binding, candidate, descriptor } from './given/query_fixtures';

describe('when validating a sound binding', () => {
    it('should report nothing', () => {
        validateBinding(descriptor, candidate, binding(), { types: { 'customer.id': 'Guid' } }).should.be.empty;
    });

    it('should accept a whole number for a fractional parameter', () => {
        validateBinding(descriptor, candidate, binding({
            arguments: [
                { parameter: 'customerId', source: { path: 'customer.id' } },
                { parameter: 'limit', source: { path: 'page.size' } },
            ],
        }), { types: { 'customer.id': 'Guid', 'page.size': 'int' } }).should.be.empty;
    });

    it('should not check argument types without a scope', () => {
        validateBinding(descriptor, candidate, binding()).should.be.empty;
    });
});
