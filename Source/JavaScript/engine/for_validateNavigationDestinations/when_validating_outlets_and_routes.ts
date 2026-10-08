// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateNavigationDestinations } from '../validateNavigationDestinations';

describe('when validating outlets and routes', () => {
    it('should report missing outlets and duplicate routes', () => {
        const diagnostics = validateNavigationDestinations(
            [
                { screen: 'Invoices', outlet: 'missing', route: 'invoices' },
                { screen: 'InvoiceDetails', route: 'invoices' },
            ],
            { layouts: [{ name: 'AppShell', slots: [], outlets: [{ name: 'content' }] }] },
        );

        diagnostics.map(diagnostic => diagnostic.code).should.have.members(['missingOutlet', 'duplicateRoute']);
    });
});
