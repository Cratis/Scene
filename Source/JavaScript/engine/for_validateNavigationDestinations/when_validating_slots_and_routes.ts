// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateNavigationDestinations } from '../validateNavigationDestinations';

describe('when validating slots and routes', () => {
    it('should report missing slots and duplicate routes', () => {
        const diagnostics = validateNavigationDestinations(
            [
                { screen: 'Invoices', slot: 'missing', route: 'invoices' },
                { screen: 'InvoiceDetails', route: 'invoices' },
            ],
            { layouts: [{ name: 'AppShell', slots: [{ name: 'content', routed: true }] }] },
        );

        diagnostics.map(diagnostic => diagnostic.code).should.have.members(['missingSlot', 'duplicateRoute']);
    });
});
