// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletNavigationItem } from '@cratis/scene.model';
import { NavigationDiagnosticCode, diagnoseNavigation, navigationEntriesFrom } from '../index';

describe('when collecting entries from navigation items', () => {
    const items: OutletNavigationItem[] = [
        { kind: OutletItemKind.Navigation, id: 'invoices', title: 'Invoices', target: { screen: 'Invoices' } },
        {
            kind: OutletItemKind.Navigation, id: 'billing', title: 'Billing', children: [
                { kind: OutletItemKind.Navigation, id: 'credit-notes', title: 'Credit notes', target: { screen: 'CreditNotes' } },
            ],
        },
    ];

    it('should check every item with a target, sub-items included, and skip the ones that only group', () =>
        diagnoseNavigation({ entries: navigationEntriesFrom(items), screens: [] })
            .map(diagnostic => [diagnostic.code, diagnostic.entry])
            .should.deep.equal([[NavigationDiagnosticCode.UnavailableTarget, 'invoices'], [NavigationDiagnosticCode.UnavailableTarget, 'credit-notes']]));
});
