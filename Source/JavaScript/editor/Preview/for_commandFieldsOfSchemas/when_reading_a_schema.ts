// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { commandFieldsOfSchemas } from '../commandFieldsOfSchemas';

const schema = JSON.stringify({
    type: 'object',
    required: ['customerName', 'quantity'],
    properties: {
        customerName: { type: 'string' },
        quantity: { type: 'integer' },
        placedOn: { type: 'string', format: 'date-time' },
        express: { type: ['boolean', 'null'] },
        lines: { type: 'array' },
        shipping: { type: 'object' },
        either: { type: ['string', 'number'] },
    },
});

describe('when reading the fields of a command from its schema', () => {
    const fields = commandFieldsOfSchemas({ PlaceOrder: schema })('PlaceOrder');
    const byName = (name: string) => fields.find(field => field.name === name);

    it('should offer what the form can present, in the order the schema declares it', () => fields.map(field => field.name).should.deep.equal(['customerName', 'quantity', 'placedOn', 'express']));
    it('should read a string, a number, a date and a nullable boolean as themselves', () => fields.map(field => field.type).should.deep.equal(['string', 'number', 'date', 'boolean']));
    it('should label a field with its name in words', () => byName('customerName')!.label!.should.equal('Customer Name'));
    it('should require what the schema lists and nothing else', () => fields.map(field => field.required).should.deep.equal([true, true, false, false]));
    it('should leave out a collection, an object and a union, which no field can hold', () => fields.some(field => ['lines', 'shipping', 'either'].includes(field.name)).should.be.false);
    it('should offer nothing for a command the application does not describe', () => commandFieldsOfSchemas({})('Unknown').should.deep.equal([]));
    it('should offer nothing for a schema that is not JSON', () => commandFieldsOfSchemas({ Broken: '{' })('Broken').should.deep.equal([]));
    it('should require every field when the schema lists none as required', () => commandFieldsOfSchemas({ A: '{"properties":{"x":{"type":"string"}}}' })('A')[0].required!.should.be.true);
});
