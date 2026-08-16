// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    arrayProperty,
    booleanProperty,
    numberProperty,
    objectArrayProperty,
    objectProperty,
    stringArrayProperty,
    stringProperty,
    unionProperty,
} from '../properties';

describe('when a property has the wrong type', () => {
    const properties: Record<string, unknown> = {
        title: 42,
        panel: 'yes',
        rows: 'ten',
        notANumber: Number.NaN,
        options: 'first,second',
        schema: ['not', 'an', 'object'],
        orientation: 'diagonal',
        fields: ['name', 7, 'number'],
        entries: [{ key: 'a' }, 'not an object'],
    };

    it('should not read a number as a string', () => (stringProperty(properties, 'title') === undefined).should.be.true);
    it('should not read a string as a boolean', () => (booleanProperty(properties, 'panel') === undefined).should.be.true);
    it('should not read a string as a number', () => (numberProperty(properties, 'rows') === undefined).should.be.true);
    it('should not read NaN as a number', () => (numberProperty(properties, 'notANumber') === undefined).should.be.true);
    it('should not read a string as an array', () => (arrayProperty(properties, 'options') === undefined).should.be.true);
    it('should not read an array as an object', () => (objectProperty(properties, 'schema') === undefined).should.be.true);

    it('should reject a value outside the allowed union', () =>
        (unionProperty(properties, 'orientation', ['vertical', 'horizontal']) === undefined).should.be.true);

    it('should keep only the string elements of a string array', () => stringArrayProperty(properties, 'fields')!.should.deep.equal(['name', 'number']));

    it('should keep only the object elements of an object array', () => objectArrayProperty(properties, 'entries')!.should.deep.equal([{ key: 'a' }]));
});
