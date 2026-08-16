// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingKind } from '@cratis/scene.components';
import { deriveArcHeading } from '../header';

class AllInvoices {}

describe('when the binding is registered', () => {
    const heading = deriveArcHeading({ title: 'Invoices', subtitle: 'Every invoice', section: 'Billing' }, { name: 'AllInvoices', target: AllInvoices }, BindingKind.Query);

    it('should use the title the template gave it', () => {
        heading.title.should.equal('Invoices');
    });

    it('should keep the subtitle', () => {
        heading.subtitle!.should.equal('Every invoice');
    });

    it('should build the trail from the section and the title, rather than a second literal', () => {
        heading.trail.should.deep.equal(['Billing', 'Invoices']);
    });

    it('should report that it is bound', () => {
        heading.isBound.should.be.true;
    });

    it('should say what it is bound to, naming the kind so a query is not mistaken for a command', () => {
        heading.bindingLabel.should.equal('Bound to query AllInvoices');
    });

    it('should keep the binding name for anything that wants to report it', () => {
        heading.bindingName!.should.equal('AllInvoices');
    });
});
