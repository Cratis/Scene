// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, DestinationKind } from '@cratis/scene.model';
import { resolveDestination } from '../navigation';

describe('when resolving deep links and dialogs', () => {
    it('should create a stable identity route with bound parameters', () => {
        const result = resolveDestination({
            module: 'billing',
            feature: 'invoices',
            slice: 'details',
            outlet: 'content',
            routeParameterBindings: { invoiceId: { kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selected.id' } },
        }, { componentOutputs: { table: { selected: { id: 'invoice-2' } } } });

        result.action.should.equal('navigate');
        result.outlet!.should.equal('content');
        result.url!.should.equal('billing/invoices/details?invoiceId=invoice-2');
    });

    it('should resolve dialog destinations without dropping the target', () => {
        const result = resolveDestination({ kind: DestinationKind.Dialog, dialog: 'confirm-delete' });

        result.action.should.equal('openDialog');
        result.dialog!.should.equal('confirm-delete');
    });
});
