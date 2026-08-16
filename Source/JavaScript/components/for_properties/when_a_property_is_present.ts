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

describe('when a property is present', () => {
    const properties: Record<string, unknown> = {
        title: 'Invoices',
        panel: false,
        rows: 0,
        options: [{ label: 'Draft', value: 'draft' }],
        fields: ['number', 'customer'],
        schema: { type: 'object' },
        orientation: 'vertical',
    };

    it('should read the string', () => stringProperty(properties, 'title')!.should.equal('Invoices'));
    it('should read a false boolean rather than treating it as absent', () => booleanProperty(properties, 'panel')!.should.equal(false));
    it('should read a zero number rather than treating it as absent', () => numberProperty(properties, 'rows')!.should.equal(0));
    it('should read the array', () => arrayProperty(properties, 'options')!.should.have.lengthOf(1));
    it('should read the string array', () => stringArrayProperty(properties, 'fields')!.should.deep.equal(['number', 'customer']));
    it('should read the object array', () => objectArrayProperty(properties, 'options')!.should.deep.equal([{ label: 'Draft', value: 'draft' }]));
    it('should read the object', () => objectProperty(properties, 'schema')!.should.deep.equal({ type: 'object' }));

    it('should read a value that is in the allowed union', () =>
        unionProperty(properties, 'orientation', ['vertical', 'horizontal'])!.should.equal('vertical'));
});
