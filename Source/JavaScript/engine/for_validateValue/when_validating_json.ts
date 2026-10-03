// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { validateValue } from '../editing/validateValue';

const descriptor: PropertyDescriptor = { path: 'value', label: 'Value', group: 'Data', valueType: PropertyValueType.Json };
const required: PropertyDescriptor = { ...descriptor, constraints: { required: true } };
const rejected = 'expected a JSON value';

function nested(depth: number): unknown {
    let value: unknown = 'leaf';
    for (let level = 0; level < depth; level++) value = [value];
    return value;
}

describe('when validating a JSON property', () => {
    it('should accept JSON primitives and nested records', () => {
        [validateValue(descriptor, 'ready'), validateValue(descriptor, 4), validateValue(descriptor, false), validateValue(descriptor, null), validateValue(descriptor, { values: [1, null, 'two'] })]
            .should.deep.equal([undefined, undefined, undefined, undefined, undefined]);
    });

    it('should accept arrays and objects that contain null', () => {
        [validateValue(descriptor, [null, { a: null }]), validateValue(descriptor, Object.create(null))].should.deep.equal([undefined, undefined]);
    });

    it('should leave an unset value alone when it is not required', () => {
        [validateValue(descriptor, undefined), validateValue(descriptor, null)].should.deep.equal([undefined, undefined]);
    });

    it('should require a value when the descriptor says so, and treat null as no value', () => {
        [validateValue(required, undefined), validateValue(required, null)].should.deep.equal(['a value is required', 'a value is required']);
    });

    it('should accept a required value that is falsy but present', () => {
        [validateValue(required, 0), validateValue(required, false), validateValue(required, ''), validateValue(required, [])].should.deep.equal([undefined, undefined, undefined, undefined]);
    });

    it('should reject numbers that JSON cannot carry', () => {
        [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].map(value => validateValue(descriptor, value)).should.deep.equal([rejected, rejected, rejected]);
    });

    it('should reject numbers that JSON cannot carry when they are nested', () => {
        [validateValue(descriptor, { value: Number.NaN }), validateValue(descriptor, [1, Number.POSITIVE_INFINITY])].should.deep.equal([rejected, rejected]);
    });

    it('should reject an undefined value nested in an object or array', () => {
        [validateValue(descriptor, { value: undefined }), validateValue(descriptor, [1, undefined]), validateValue(descriptor, new Array(3))].should.deep.equal([rejected, rejected, rejected]);
    });

    it('should reject a function, a symbol and a bigint, also when nested', () => {
        [() => 1, Symbol('x'), BigInt(1), { handler: () => 1 }, [Symbol('x')]].map(value => validateValue(descriptor, value)).should.deep.equal([rejected, rejected, rejected, rejected, rejected]);
    });

    it('should reject a non-JSON object', () => {
        const problem = validateValue(descriptor, new Date()) ?? '';
        problem.should.equal(rejected);
    });

    it('should reject a class instance and an array subclass', () => {
        class Point { x = 1; }
        class Points extends Array<number> {}
        [validateValue(descriptor, new Point()), validateValue(descriptor, [new Point()]), validateValue(descriptor, Points.from([1, 2])), validateValue(descriptor, new Map()), validateValue(descriptor, new Set())]
            .should.deep.equal([rejected, rejected, rejected, rejected, rejected]);
    });

    it('should reject a cyclic object', () => {
        const value: { self?: unknown } = {};
        value.self = value;
        const problem = validateValue(descriptor, value) ?? '';
        problem.should.equal(rejected);
    });

    it('should accept a value that repeats a shared child, which is not a cycle', () => {
        const shared = { n: 1 };
        (validateValue(descriptor, { a: shared, b: shared, c: [shared, shared] }) === undefined).should.equal(true);
    });

    it('should accept nesting up to the depth limit and reject nesting beyond it without overflowing the stack', () => {
        [validateValue(descriptor, nested(60)), validateValue(descriptor, nested(100_000))].should.deep.equal([undefined, rejected]);
    });

    it('should inspect a value without changing it', () => {
        const value = { zero: -0, large: 1e21, list: [1, { deep: null }] };
        validateValue(descriptor, value);
        const kept = Object.is(value.zero, -0) && value.large === 1e21 && value.list.length === 2 && Object.keys(value).join() === 'zero,large,list';
        kept.should.equal(true);
    });

    it('should keep every other value type as strict as before', () => {
        const checks = [
            validateValue({ ...descriptor, valueType: PropertyValueType.String }, 4),
            validateValue({ ...descriptor, valueType: PropertyValueType.Number }, Number.NaN),
            validateValue({ ...descriptor, valueType: PropertyValueType.Number }, '4'),
            validateValue({ ...descriptor, valueType: PropertyValueType.Boolean }, 'true'),
            validateValue({ ...descriptor, valueType: PropertyValueType.Enum, choices: [{ value: 'a', label: 'A' }] }, 'b'),
            validateValue({ ...descriptor, valueType: PropertyValueType.Collection }, { not: 'a list' }),
            validateValue({ ...descriptor, valueType: PropertyValueType.Object }, 'text'),
        ];
        checks.should.deep.equal(['expected a string', 'expected a number', 'expected a number', 'expected true or false', 'not one of the allowed choices', 'expected a list', 'expected a structured value']);
    });
});
