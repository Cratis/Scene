// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    clearBindings,
    registerCommand,
    registerQuery,
    registeredCommandNames,
    registeredQueryNames,
    resolveCommand,
    resolveQuery,
} from '../bindingRegistry';

class AllInvoices {}
class RegisterInvoice {}

describe('when bindings are cleared', () => {
    beforeEach(() => {
        clearBindings();
        registerQuery('AllInvoices', AllInvoices);
        registerCommand('RegisterInvoice', RegisterInvoice);
        clearBindings();
    });

    it('should no longer resolve the query', () => (resolveQuery('AllInvoices') === undefined).should.be.true);
    it('should no longer resolve the command', () => (resolveCommand('RegisterInvoice') === undefined).should.be.true);
    it('should list no query names', () => registeredQueryNames().should.be.empty);
    it('should list no command names', () => registeredCommandNames().should.be.empty);
});
