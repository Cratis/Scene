// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { externalComponent } from '../../given';
import { clearBindings, registerQuery } from '../../bindings';
import { SceneDataTable } from '../SceneDataTable';

class AllInvoices {}

describe('when the query binding is missing', () => {
    beforeEach(() => clearBindings());
    afterEach(() => clearBindings());

    describe('and the screen names a query nothing is registered under', () => {
        beforeEach(() => {
            const element = externalComponent('Cratis.Components:dataTable', { query: 'AllInvoices', emptyMessage: 'No invoices' });
            render(<SceneDataTable element={element} slots={{}} />);
        });

        it('should render a placeholder naming the binding rather than throwing', () =>
            expect(screen.getByText("Unresolved query binding 'AllInvoices' on Cratis.Components:dataTable")).to.exist);
    });

    describe('and the screen names no query at all', () => {
        beforeEach(() => {
            const element = externalComponent('Cratis.Components:dataTable', { emptyMessage: 'No invoices' });
            render(<SceneDataTable element={element} slots={{}} />);
        });

        it('should render a placeholder saying the binding is missing', () =>
            expect(screen.getByText('Missing query binding on Cratis.Components:dataTable')).to.exist);
    });

    describe('and the named query is registered', () => {
        beforeEach(() => {
            registerQuery('AllInvoices', AllInvoices);
            const element = externalComponent('Cratis.Components:dataTable', { query: 'AllInvoices', emptyMessage: 'No invoices' });
            render(<SceneDataTable element={element} slots={{}} />);
        });

        it('should render no placeholder', () => (screen.queryByText(/query binding/) === null).should.be.true);

        it('should hand off to the lazily loaded Arc-bound table', () =>
            expect(document.querySelector('[data-scene-arc-loading]')).to.exist);
    });
});
