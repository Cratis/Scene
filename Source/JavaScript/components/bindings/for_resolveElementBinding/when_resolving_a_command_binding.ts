// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { externalComponent } from '../../given';
import { BindingKind } from '../BindingKind';
import { clearBindings, registerCommand, registerQuery } from '../bindingRegistry';
import { resolveElementBinding } from '../resolveElementBinding';

class RegisterInvoice {}
class SameNameQuery {}

describe('when resolving a command binding', () => {
    beforeEach(() => {
        clearBindings();
        registerCommand('RegisterInvoice', RegisterInvoice);
        registerQuery('ApproveInvoice', SameNameQuery);
    });

    afterEach(() => clearBindings());

    describe('and the element names a registered command', () => {
        const binding = () =>
            resolveElementBinding(externalComponent('Cratis.Components:commandForm', { command: 'RegisterInvoice' }), BindingKind.Command);

        it('should carry the registered class', () => binding().target!.should.equal(RegisterInvoice));
    });

    describe('and a query happens to be registered under the same name', () => {
        const binding = () =>
            resolveElementBinding(externalComponent('Cratis.Components:commandForm', { command: 'ApproveInvoice' }), BindingKind.Command);

        it('should not satisfy a command binding from the query registry', () => (binding().target === undefined).should.be.true);
    });
});
