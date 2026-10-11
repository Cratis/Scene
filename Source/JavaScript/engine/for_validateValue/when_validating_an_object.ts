// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { validateValue } from '../editing/validateValue';

const text = (path: string): PropertyDescriptor => ({ path, label: path, group: 'Data', valueType: PropertyValueType.String });
const count = (path: string): PropertyDescriptor => ({ path, label: path, group: 'Data', valueType: PropertyValueType.Number, constraints: { integer: true } });

const described: PropertyDescriptor = {
    path: 'pager', label: 'Pager', group: 'Data', valueType: PropertyValueType.Object,
    properties: [text('caption'), count('size'), {
        path: 'range', label: 'Range', group: 'Data', valueType: PropertyValueType.Object, properties: [count('from'), count('to')],
    }, {
        path: 'steps', label: 'Steps', group: 'Data', valueType: PropertyValueType.Collection, item: { properties: [text('title')] },
    }],
};

describe('when validating an object property', () => {
    it('should accept a record whose fields fit their descriptors', () => {
        (validateValue(described, { caption: 'Pages', size: 10, range: { from: 1, to: 5 }, steps: [{ id: 'a', title: 'First' }] }) === undefined).should.equal(true);
    });

    it('should accept a record that leaves optional fields out', () => {
        (validateValue(described, {}) === undefined).should.equal(true);
    });

    it('should name the field that has an unacceptable value', () => {
        validateValue(described, { size: 'ten' })!.should.equal('size expected a number');
    });

    it('should check nested objects', () => {
        validateValue(described, { range: { from: 1.5 } })!.should.equal('range from expected a whole number');
    });

    it('should reject a field the descriptor does not describe', () => {
        validateValue(described, { colour: 'red' })!.should.equal('colour is not a field of this object');
    });

    it('should reject a value that is not a record when fields are described', () => {
        [validateValue(described, 'text'), validateValue(described, [])].should.deep.equal(['expected a structured value', 'expected a structured value']);
    });

    it('should require a described field that is marked required', () => {
        const required = { ...described, properties: [{ ...text('caption'), constraints: { required: true } }] };
        validateValue(required, {})!.should.equal('caption a value is required');
    });

    it('should keep accepting any record or array when no fields are described', () => {
        const opaque: PropertyDescriptor = { path: 'x', label: 'X', group: 'Data', valueType: PropertyValueType.Object, editorKind: 'size' };
        [validateValue(opaque, { width: 1 }), validateValue(opaque, [1]), validateValue(opaque, 'text')].should.deep.equal([undefined, undefined, 'expected a structured value']);
    });
});
