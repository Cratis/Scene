// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode } from '@cratis/scene.model';
import { insertDataField } from '../insertDataField';
import { insertionFor, placedForm } from './given';

describe('when dropping a command property on a screen that has the command form', () => {
    const { insertion, recorded } = insertionFor([placedForm()], [{ name: 'SetProductPrice', forCommand: 'SetProductPrice', generationMode: FormGenerationMode.Manual, fields: [{ name: 'sku', sourceProperty: 'sku', label: 'sku' }] }]);
    insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'price', type: 'Money' }, { parentId: undefined, index: undefined }, insertion);

    it('should not put another form on the screen', () => recorded.inserted.length.should.equal(0));
    it('should add the property after the fields the form has', () => recorded.forms[0][0].fields.map(field => field.name).should.deep.equal(['sku', 'price']));
    it('should select the form the field went on', () => recorded.selected.should.deep.equal(['form']));
});

describe('when dropping a command property the form already has', () => {
    const { insertion, recorded } = insertionFor([placedForm()], [{ name: 'SetProductPrice', forCommand: 'SetProductPrice', fields: [{ name: 'sku' }, { name: 'price' }] }]);
    insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'price', type: 'Money' }, { parentId: undefined, index: undefined }, insertion);

    it('should change nothing', () => [recorded.inserted.length, recorded.forms.length].should.deep.equal([0, 0]));
    it('should select the form that has it', () => recorded.selected.should.deep.equal(['form']));
});

describe('when dropping a command property on a screen whose form is not placed', () => {
    const { insertion, recorded } = insertionFor([], [{ name: 'SetProductPrice', forCommand: 'SetProductPrice', generationMode: FormGenerationMode.Manual, fields: [{ name: 'sku', sourceProperty: 'sku' }] }]);
    insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'price', type: 'Money' }, { parentId: 'screen-root', index: 0 }, insertion);

    it('should keep the fields the form has and add the property after them', () => recorded.forms[0][0].fields.map(field => field.name).should.deep.equal(['sku', 'price']));
    it('should put a command form on the screen to show it', () => recorded.inserted.length.should.equal(1));
});

describe('when the profile has no command form to put a property on', () => {
    const { insertion, recorded } = insertionFor([], [], { core: ['text'] });
    const refusal = insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'price', type: 'Money' }, { parentId: undefined, index: undefined }, insertion);

    it('should say so', () => refusal!.should.equal('noCommandForm'));
    it('should change nothing', () => [recorded.forms.length, recorded.inserted.length].should.deep.equal([0, 0]));
});
