// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind } from '@cratis/scene.model';
import { createReExposedDocument } from '../given/a_scene_document';
import { items, resolve, scalar, valueOf } from './given/resolution';

describe('when two instances configure the same template', () => {
    const document = createReExposedDocument();
    document.instanceContributions.push(
        scalar('screen:Invoices', 'title', 'Invoices'),
        items('screen:Invoices', { id: 'inv-new', values: { label: 'New invoice' } }),
        scalar('screen:Customers', 'title', 'Customers'),
    );
    const invoices = resolve(document, EditingScopeKind.Screen, 'Invoices');
    const customers = resolve(document, EditingScopeKind.Screen, 'Customers');

    it('should give each its own scalar value', () => {
        (valueOf(invoices, 'navbar', 'title')!.value as string).should.equal('Invoices');
        (valueOf(customers, 'navbar', 'title')!.value as string).should.equal('Customers');
    });

    it('should give each its own items', () => {
        valueOf(invoices, 'navbar', 'items')!.items!.map(item => item.id).should.deep.equal(['home', 'inv-new']);
        valueOf(customers, 'navbar', 'items')!.items!.map(item => item.id).should.deep.equal(['home']);
    });

    it('should not report the other instance\'s contributions as a problem', () => {
        invoices.diagnostics.should.be.empty;
        customers.diagnostics.should.be.empty;
    });
});
