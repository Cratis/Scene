// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { clearBindings, registerQueries, registerQuery, registeredQueryNames, resolveCommand, resolveQuery } from '../bindingRegistry';

class AllInvoices {}
class InvoiceById {}
class OverdueInvoices {}

describe('when a query is registered', () => {
    beforeEach(() => {
        clearBindings();
        registerQuery('AllInvoices', AllInvoices);
        registerQueries({ InvoiceById, OverdueInvoices });
    });

    afterEach(() => clearBindings());

    it('should resolve the class registered under the name', () => resolveQuery('AllInvoices')!.should.equal(AllInvoices));

    it('should resolve every class registered in bulk', () => {
        resolveQuery('InvoiceById')!.should.equal(InvoiceById);
        resolveQuery('OverdueInvoices')!.should.equal(OverdueInvoices);
    });

    it('should list every registered name in sorted order', () =>
        registeredQueryNames().should.deep.equal(['AllInvoices', 'InvoiceById', 'OverdueInvoices']));

    it('should not resolve the same name as a command', () => (resolveCommand('AllInvoices') === undefined).should.be.true);
});
