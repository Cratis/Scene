// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { NavigationDiagnosticCode } from '@cratis/scene.engine';
import { diagnoseRenderedNavigation } from '../navigation';

describe('when comparing rendered routes', () => {
    const diagnostics = diagnoseRenderedNavigation({
        entries: [
            { id: 'invoice', destination: { screen: 'InvoiceDetails', route: '/invoices/{id}' } },
            { id: 'credit-note', destination: { screen: 'CreditNoteDetails', route: 'invoices/:creditNoteId' } },
            { id: 'derived', destination: { module: 'Sales', feature: 'Invoices' } },
            { id: 'authored', destination: { screen: 'SalesOverview', route: 'Sales/Invoices' } },
            { id: 'same-target', destination: { module: 'Sales', feature: 'Invoices', route: '/Sales/Invoices/' } },
            { id: 'docs', destination: { kind: DestinationKind.External, route: 'invoices/{id}' } },
        ],
    });

    it('should treat parameter spellings and identity-derived routes as the URLs they become', () =>
        diagnostics.should.deep.equal([
            {
                code: NavigationDiagnosticCode.DuplicateRoute,
                entry: 'credit-note',
                message: "Route 'invoices/:creditNoteId' is used by destinations 'invoice' and 'credit-note', which open different targets.",
            },
            {
                code: NavigationDiagnosticCode.DuplicateRoute,
                entry: 'authored',
                message: "Route 'Sales/Invoices' is used by destinations 'derived' and 'authored', which open different targets.",
            },
        ]));
});
