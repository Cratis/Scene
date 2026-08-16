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

describe('when a property is missing', () => {
    const properties: Record<string, unknown> = {};

    it('should read no string', () => (stringProperty(properties, 'title') === undefined).should.be.true);
    it('should read no boolean', () => (booleanProperty(properties, 'panel') === undefined).should.be.true);
    it('should read no number', () => (numberProperty(properties, 'rows') === undefined).should.be.true);
    it('should read no array', () => (arrayProperty(properties, 'options') === undefined).should.be.true);
    it('should read no string array', () => (stringArrayProperty(properties, 'fields') === undefined).should.be.true);
    it('should read no object array', () => (objectArrayProperty(properties, 'options') === undefined).should.be.true);
    it('should read no object', () => (objectProperty(properties, 'schema') === undefined).should.be.true);
    it('should read no union value', () => (unionProperty(properties, 'orientation', ['vertical', 'horizontal']) === undefined).should.be.true);
});
