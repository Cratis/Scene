// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { validateValue } from '../editing/validateValue';

const descriptor: PropertyDescriptor = { path: 'value', label: 'Value', group: 'Data', valueType: PropertyValueType.Json };

describe('when validating a JSON property', () => {
    it('should accept JSON primitives and nested records', () => {
        [validateValue(descriptor, 'ready'), validateValue(descriptor, 4), validateValue(descriptor, false), validateValue(descriptor, null), validateValue(descriptor, { values: [1, null, 'two'] })]
            .should.deep.equal([undefined, undefined, undefined, undefined, undefined]);
    });

    it('should reject a non-JSON object', () => {
        const problem = validateValue(descriptor, new Date()) ?? '';
        problem.should.equal('expected a JSON value');
    });

    it('should reject a cyclic object', () => {
        const value: { self?: unknown } = {};
        value.self = value;
        const problem = validateValue(descriptor, value) ?? '';
        problem.should.equal('expected a JSON value');
    });
});
