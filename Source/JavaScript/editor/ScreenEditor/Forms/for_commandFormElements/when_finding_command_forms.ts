// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { commandEdit, commandFormElements, isCommandFormType } from '../commandFormElements';
import { formOfCommand, sliceOfCommand } from '../formEditing';

const register: StateChangeSlice = { id: 'slice-1', name: 'RegisterInvoice', origin: [], inputs: [{ name: 'customer', type: 'string', required: true }] };
const cancel: StateChangeSlice = { id: 'slice-2', name: 'CancelInvoice', origin: [], inputs: [] };
const slices = [register, cancel];

describe('when finding the command forms of a screen', () => {
    const nested = createExternalComponent('card', 'Card', 'Cratis.Components:card', {}, {
        content: [createExternalComponent('second', 'Second', 'Cratis.Components:commandForm', { command: 'slice-2' })],
    });
    const roots = [
        createExternalComponent('first', 'First', 'commandForm', { command: 'slice-1' }),
        createExternalComponent('table', 'Table', 'Cratis.Components:table'),
        nested,
        createExternalComponent('unset', 'Unset', 'Stage:commandForm'),
    ];
    const found = commandFormElements(roots, slices);

    it('should find a command form wherever it is placed, and nothing else', () => found.map(element => element.elementId).should.deep.equal(['first', 'second', 'unset']));
    it('should name the command each element owns by its slice', () => found.map(element => element.commandName).should.deep.equal(['RegisterInvoice', 'CancelInvoice', undefined]));
    it('should keep the slice id the element stores', () => found.map(element => element.command).should.deep.equal(['slice-1', 'slice-2', '']));
});

describe('when recognising a command form component', () => {
    it('should accept it bare or qualified by its package', () => [isCommandFormType('commandForm'), isCommandFormType('Stage:commandForm'), isCommandFormType('Cratis.Components:commandForm')].should.deep.equal([true, true, true]));
    it('should not accept another component', () => [isCommandFormType('action'), isCommandFormType('Cratis.Components:commandFormLayout')].should.deep.equal([false, false]));
});

describe('when joining an element to its form', () => {
    const forms = [{ name: 'Register', forCommand: 'RegisterInvoice', fields: [] }, { name: 'Cancel', forCommand: 'CancelInvoice', fields: [] }];

    it('should find the slice by the id the element stores', () => sliceOfCommand(slices, 'slice-2')!.should.equal(cancel));
    it('should find no slice for a command the model does not have', () => (sliceOfCommand(slices, 'gone') === undefined).should.be.true);
    it('should find no slice for an element that names no command', () => (sliceOfCommand(slices, undefined) === undefined && sliceOfCommand(slices, '') === undefined).should.be.true);
    it('should find the form through the slice name', () => formOfCommand(forms, register)!.name.should.equal('Register'));
    it('should find no form for a command nothing authored a form for', () => (formOfCommand([forms[0]], cancel) === undefined).should.be.true);
});

describe('when choosing a command for an element', () => {
    it('should set the slice id as the element command', () => commandEdit('first', cancel).should.deep.include({ kind: SceneEditKind.SetProperty, path: 'command', value: 'slice-2' }));
    it('should reset the command when none is chosen', () => commandEdit('first', undefined).should.deep.include({ kind: SceneEditKind.ResetProperty, path: 'command' }));
});
