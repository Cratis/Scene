// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode } from '@cratis/scene.model';
import { commandNameOf, sliceNamedBy, type StateChangeSlice } from '../../Actions/StateChangeSlice';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { commandFormElements } from '../commandFormElements';
import { autoFormFor, formOfCommand } from '../formEditing';

// A slice is shown by its name, but a stage knows the command by the command's own name, which is what a form is for.
const register: StateChangeSlice = { id: 'slice-1', name: 'Register an invoice', commandName: 'RegisterInvoice', origin: [], inputs: [{ name: 'customer', type: 'string', required: true }] };
const plain: StateChangeSlice = { id: 'slice-2', name: 'CancelInvoice', origin: [], inputs: [] };
const twin: StateChangeSlice = { id: 'slice-3', name: 'Register again', commandName: 'RegisterInvoice', origin: [], inputs: [] };

describe('when a slice\'s command has a name of its own', () => {
    it('should be known by that name', () => commandNameOf(register).should.equal('RegisterInvoice'));
    it('should be known by the slice\'s name when it has none', () => commandNameOf(plain).should.equal('CancelInvoice'));
    it('should be found by the id an element stores', () => sliceNamedBy([register, plain], 'slice-1')!.should.equal(register));
    it('should be found by its command\'s name, as a document read back from Screenplay names it', () => sliceNamedBy([register, plain], 'RegisterInvoice')!.should.equal(register));
    it('should not be found by the slice\'s name', () => (sliceNamedBy([register, plain], 'Register an invoice') === undefined).should.be.true);
    it('should not be found by a name two slices\' commands share', () => (sliceNamedBy([register, twin], 'RegisterInvoice') === undefined).should.be.true);
    it('should still be found by id when two slices\' commands share a name', () => sliceNamedBy([register, twin], 'slice-3')!.should.equal(twin));
});

describe('when a form is written for such a command', () => {
    const form = autoFormFor(register);

    it('should be for the command, not the slice', () => form.forCommand.should.equal('RegisterInvoice'));
    it('should be named for the command', () => form.name.should.equal('RegisterInvoice'));
    it('should follow the command', () => form.generationMode!.should.equal(FormGenerationMode.Auto));
    it('should be the form of the element that names the slice by id', () => formOfCommand([form], register)!.should.equal(form));
    it('should be the form of the element a document read back names by the command', () =>
        commandFormElements([createExternalComponent('f', 'F', 'commandForm', { command: 'RegisterInvoice' })], [register]).map(element => element.commandName).should.deep.equal(['RegisterInvoice']));
});
