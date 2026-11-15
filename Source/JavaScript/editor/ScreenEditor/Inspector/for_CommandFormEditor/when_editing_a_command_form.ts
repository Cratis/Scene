// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormGenerationMode, type Form } from '@cratis/scene.model';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { autoFormFor } from '../../Forms/formEditing';
import { CommandFormEditor } from '../CommandFormEditor';

const strings = defaultScreenEditorStrings;
const register: StateChangeSlice = { id: 'slice-1', name: 'RegisterInvoice', origin: [], inputs: [{ name: 'customer', type: 'string', required: true }, { name: 'amount', type: 'number', required: false }] };
const noop = () => undefined;

const draw = (command: string | undefined, forms: Form[]) => renderToStaticMarkup(React.createElement(CommandFormEditor, {
    elementId: 'order-form', command, slices: [register], forms, strings, disabled: false,
    onCommandChange: noop, onFormChange: noop, onFormCreate: noop,
}));

describe('when a command form element names no command', () => {
    const markup = draw(undefined, [autoFormFor(register)]);

    it('should offer the commands of the model', () => markup.should.contain('RegisterInvoice'));
    it('should ask for a command', () => markup.should.contain(strings.properties.commandForm.chooseCommandHint));
    it('should not draw a form that no command leads to', () => markup.should.not.contain(strings.properties.forms.mode));
});

describe('when a command form element names a command that has a form', () => {
    const markup = draw('slice-1', [autoFormFor(register)]);

    it('should show the command as chosen', () => markup.should.match(/<option value="slice-1" selected/));
    it('should edit the form of that command on the element', () => markup.should.contain(strings.properties.forms.mode));
    it('should offer the fields of the command', () => markup.should.contain('customer').and.contain('amount'));
    it('should not offer to create a form', () => markup.should.not.contain(strings.properties.commandForm.createForm('RegisterInvoice')));
});

describe('when a command form element names a command nothing has a form for', () => {
    const markup = draw('slice-1', []);

    it('should offer to create the form', () => markup.should.contain(strings.properties.commandForm.createForm('RegisterInvoice')));
    it('should not draw a form editor', () => markup.should.not.contain(strings.properties.forms.mode));
});

describe('when a command form element names a command the model no longer has', () => {
    const markup = draw('slice-gone', []);

    it('should say so', () => markup.should.contain(strings.properties.commandForm.unknownCommand));
    it('should keep the stored command visible', () => markup.should.contain('slice-gone'));
});

describe('when the form of the command is manual', () => {
    const manual: Form = { ...autoFormFor(register), generationMode: FormGenerationMode.Manual };

    it('should draw the layout editor', () => draw('slice-1', [manual]).should.contain(strings.properties.forms.columns));
});
