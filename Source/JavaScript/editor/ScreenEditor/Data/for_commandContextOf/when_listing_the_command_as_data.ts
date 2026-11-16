// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, type Form, type QueryCandidate } from '@cratis/scene.model';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { commandContextOf } from '../commandContext';

const addProduct: StateChangeSlice = {
    id: 'slice-1', name: 'Add product', commandName: 'DraftProduct', origin: [],
    inputs: [{ name: 'sku', type: 'ProductSku', required: true }, { name: 'category', type: 'CategoryId', required: true }, { name: 'description', type: 'Text', required: false }],
};
const allCategories: QueryCandidate = {
    id: 'q', name: 'AllCategories', origin: [], parameters: [], resultShape: 'collection',
    resultFields: [{ name: 'id', type: 'CategoryId', isIdentity: true }, { name: 'name', type: 'string' }],
};
const form = createExternalComponent('form', 'Form', 'Cratis.Components:commandForm', { command: 'slice-1' });
const written = (...properties: string[]): Form => ({ name: 'DraftProduct', forCommand: 'DraftProduct', generationMode: FormGenerationMode.Manual, fields: properties.map(property => ({ name: property, sourceProperty: property })) });

describe('when listing the command of a screen as data', () => {
    const context = commandContextOf('slice-1', [addProduct], [written('sku')], [form], [allCategories])!;

    it('should name the command', () => context.name.should.equal('DraftProduct'));
    it('should list the properties in the order the command declares them', () => context.properties.map(property => property.field.property).should.deep.equal(['sku', 'category', 'description']));
    it('should carry the concept of each property', () => context.properties.map(property => property.field.type).should.deep.equal(['ProductSku', 'CategoryId', 'Text']));
    it('should say which properties the form has a field for', () => context.properties.map(property => property.placed).should.deep.equal([true, false, false]));
    it('should say which properties the command requires', () => context.properties.map(property => property.required).should.deep.equal([true, true, false]));
    it('should say the form is not complete', () => context.complete.should.be.false);
    it('should say the property that keys a list is a picker over it', () => context.properties[1].choices!.should.deep.equal({ query: 'AllCategories', show: 'name' }));
    it('should say a plain property is not', () => (context.properties[2].choices === undefined).should.be.true);
});

describe('when the screen has no command form', () => {
    const context = commandContextOf('slice-1', [addProduct], [written('sku')], [], [])!;

    it('should place nothing', () => context.properties.some(property => property.placed).should.be.false);
    it('should say there is no form', () => context.hasForm.should.be.false);
});

describe('when the form follows the command', () => {
    const context = commandContextOf('slice-1', [addProduct], [], [form], [])!;

    it('should place every property', () => context.complete.should.be.true);
});

describe('when the command is not known', () => {
    it('should list nothing', () => (commandContextOf('other', [addProduct], [], [], []) === undefined).should.be.true);
});
