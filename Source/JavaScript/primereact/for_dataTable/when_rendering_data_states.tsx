// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen, within } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

const columns = [sceneComponent('t-name', 'column', { field: 'name', header: 'Name' }), sceneComponent('t-total', 'column', { field: 'total', header: 'Total' })];
const rows = [{ name: 'Northwind Traders', total: '$1,240.00' }, { name: 'Contoso Ltd', total: '$318.50' }];

function renderTable(properties: Record<string, unknown>) {
    return render(<PrimeReactProvider>
        <SceneElementView element={sceneComponent('orders', 'dataTable', properties, { columns })} registry={primeReactComponents} />
    </PrimeReactProvider>);
}

describe('when rendering data states', () => {
    it('should render the seeded rows under their column headers', () => {
        renderTable({ rows });
        screen.getAllByRole('columnheader').map(header => header.textContent).should.deep.equal(['Name', 'Total']);
        Boolean(screen.getByText('Northwind Traders')).should.equal(true);
        (screen.queryByRole('status') === null && screen.queryByRole('alert') === null).should.equal(true);
    });

    it('should render the empty message when there are no rows', () => {
        renderTable({ rows: [], emptyMessage: 'No orders yet' });
        Boolean(screen.getByText('No orders yet')).should.equal(true);
    });

    it('should announce loading and hide stale rows', () => {
        const { container } = renderTable({ rows, loading: true });
        screen.getByRole('status').textContent!.should.equal('Loading…');
        (screen.queryByText('Northwind Traders') === null).should.equal(true);
        (container.querySelector('[aria-busy="true"]') !== null).should.equal(true);
    });

    it('should announce an error in place of the rows and keep the headers', () => {
        renderTable({ rows, error: 'Orders could not be loaded.' });
        screen.getByRole('alert').textContent!.should.equal('Orders could not be loaded.');
        (screen.queryByText('Northwind Traders') === null).should.equal(true);
        within(screen.getByRole('table')).getAllByRole('columnheader').length.should.equal(2);
    });
});
