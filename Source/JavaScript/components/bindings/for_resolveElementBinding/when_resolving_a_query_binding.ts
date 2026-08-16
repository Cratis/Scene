// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { externalComponent } from '../../given';
import { BindingKind } from '../BindingKind';
import { clearBindings, registerQuery } from '../bindingRegistry';
import { resolveElementBinding } from '../resolveElementBinding';

class AllInvoices {}

describe('when resolving a query binding', () => {
    beforeEach(() => {
        clearBindings();
        registerQuery('AllInvoices', AllInvoices);
    });

    afterEach(() => clearBindings());

    describe('and the element names a registered query', () => {
        const binding = () => resolveElementBinding(externalComponent('Cratis.Components:dataTable', { query: 'AllInvoices' }), BindingKind.Query);

        it('should carry the name the element asked for', () => binding().name!.should.equal('AllInvoices'));
        it('should carry the registered class', () => binding().target!.should.equal(AllInvoices));
    });

    describe('and the element names a query nothing is registered under', () => {
        const binding = () => resolveElementBinding(externalComponent('Cratis.Components:dataTable', { query: 'AllCustomers' }), BindingKind.Query);

        it('should still carry the name, so the placeholder can report it', () => binding().name!.should.equal('AllCustomers'));
        it('should carry no class', () => (binding().target === undefined).should.be.true);
    });

    describe('and the element names no query at all', () => {
        const binding = () => resolveElementBinding(externalComponent('Cratis.Components:dataTable'), BindingKind.Query);

        it('should carry no name', () => (binding().name === undefined).should.be.true);
        it('should carry no class', () => (binding().target === undefined).should.be.true);
    });

    describe('and the element carries the name under the command property instead', () => {
        const binding = () => resolveElementBinding(externalComponent('Cratis.Components:dataTable', { command: 'AllInvoices' }), BindingKind.Query);

        it('should not read a command name as a query name', () => (binding().name === undefined).should.be.true);
    });
});
