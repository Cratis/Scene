// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationItem } from '@cratis/scene.model';
import { NavigationDiagnosticCode, diagnoseNavigation, navigationEntriesFrom } from '../index';

describe('when collecting entries from navigation items', () => {
    const items: NavigationItem[] = [
        { id: 'legacy', label: 'Invoices', targetScreen: 'Invoices', routeParameterBindings: {} },
        { id: 'typed', label: 'Credit notes', targetScreen: '', routeParameterBindings: {}, destination: { screen: 'CreditNotes' } },
    ];

    it('should check legacy target screens and typed destinations the same way', () =>
        diagnoseNavigation({ entries: navigationEntriesFrom(items), screens: [] })
            .map(diagnostic => [diagnostic.code, diagnostic.entry])
            .should.deep.equal([[NavigationDiagnosticCode.UnavailableTarget, 'legacy'], [NavigationDiagnosticCode.UnavailableTarget, 'typed']]));
});
