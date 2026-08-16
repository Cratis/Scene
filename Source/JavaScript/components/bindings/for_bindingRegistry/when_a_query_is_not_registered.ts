// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { clearBindings, registerQuery, resolveQuery } from '../bindingRegistry';

class AllInvoices {}

describe('when a query is not registered', () => {
    beforeEach(() => {
        clearBindings();
        registerQuery('AllInvoices', AllInvoices);
    });

    afterEach(() => clearBindings());

    it('should resolve to undefined rather than throwing', () => (resolveQuery('AllCustomers') === undefined).should.be.true);
});
