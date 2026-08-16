// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { clearBindings, registerCommand, registerCommands, registeredCommandNames, resolveCommand, resolveQuery } from '../bindingRegistry';

class RegisterInvoice {}
class ApproveInvoice {}
class RegisterInvoiceV2 {}

describe('when a command is registered', () => {
    beforeEach(() => {
        clearBindings();
        registerCommand('RegisterInvoice', RegisterInvoice);
        registerCommands({ ApproveInvoice });
    });

    afterEach(() => clearBindings());

    it('should resolve the class registered under the name', () => resolveCommand('RegisterInvoice')!.should.equal(RegisterInvoice));
    it('should resolve every class registered in bulk', () => resolveCommand('ApproveInvoice')!.should.equal(ApproveInvoice));
    it('should list every registered name in sorted order', () => registeredCommandNames().should.deep.equal(['ApproveInvoice', 'RegisterInvoice']));
    it('should not resolve the same name as a query', () => (resolveQuery('RegisterInvoice') === undefined).should.be.true);

    describe('and the same name is registered again', () => {
        beforeEach(() => registerCommand('RegisterInvoice', RegisterInvoiceV2));

        it('should resolve to the class registered last', () => resolveCommand('RegisterInvoice')!.should.equal(RegisterInvoiceV2));
        it('should not list the name twice', () => registeredCommandNames().should.deep.equal(['ApproveInvoice', 'RegisterInvoice']));
    });
});
