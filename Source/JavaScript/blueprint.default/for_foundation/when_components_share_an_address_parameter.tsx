// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { DataList, GlobalSearch, OrgTree, foundationElement } from '../foundation';

const columns = [{ field: 'name', header: 'Name' }, { field: 'location', header: 'Location' }];
const rows = [
    { id: '1', name: 'Pallet jack', location: 'Warehouse / Aisle A' },
    { id: '2', name: 'Hand truck', location: 'Warehouse / Aisle B' },
    { id: '3', name: 'Barcode scanner', location: 'Cold store' },
];
const nodes = [{ id: 'Warehouse', label: 'Warehouse' }, { id: 'Warehouse / Aisle A', label: 'Aisle A', parentId: 'Warehouse' }, { id: 'Cold store', label: 'Cold store' }];
const names = () => Array.from(document.querySelectorAll('tbody th')).map(cell => cell.textContent);

// A search box and the list it narrows, or a tree and the list of what is beneath the chosen branch, are separate components that agree through one address parameter.
describe('when components share an address parameter', () => {
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and a search box and a list use the same parameter', () => {
        beforeEach(() => {
            render(<>
                <GlobalSearch element={foundationElement('globalSearch', { label: 'Search items', urlKey: 'itemsq' })} slots={{}} />
                <DataList element={foundationElement('dataList', { label: 'Items', rows, columns, urlKey: 'items' })} slots={{}} />
            </>);
        });

        it('should show every row until something is typed', () => names().should.deep.equal(['Pallet jack', 'Hand truck', 'Barcode scanner']));

        it('should narrow the list as the user types', () => {
            fireEvent.change(screen.getByRole('searchbox', { name: 'Search items' }), { target: { value: 'truck' } });
            names().should.deep.equal(['Hand truck']);
            window.location.search.should.equal('?itemsq=truck');
        });

        it('should find a row by its title although the title is not a column', () => {
            cleanup();
            window.history.replaceState(null, '', '/?titledq=barcode');
            render(<DataList element={foundationElement('dataList', { label: 'Titled', rows, columns: [{ field: 'location', header: 'Location' }], titleField: 'name', variant: 'cards', urlKey: 'titled' })} slots={{}} />);
            screen.getAllByRole('listitem').map(item => item.textContent).join(' ').should.contain('Barcode scanner');
            screen.getAllByRole('listitem').length.should.equal(1);
        });

        it('should select a card when the card itself is pressed', () => {
            cleanup();
            window.history.replaceState(null, '', '/');
            render(<DataList element={foundationElement('dataList', { label: 'Cards', rows, columns, titleField: 'name', variant: 'cards', selectionMode: 'single', urlKey: 'cards' })} slots={{}} />);
            fireEvent.click(screen.getByText('Hand truck'));
            new URLSearchParams(window.location.search).get('cardsselected')!.should.equal('2');
        });

        it('should show every row again when the search is cleared', () => {
            fireEvent.change(screen.getByRole('searchbox', { name: 'Search items' }), { target: { value: 'truck' } });
            fireEvent.change(screen.getByRole('searchbox', { name: 'Search items' }), { target: { value: '' } });
            names().length.should.equal(3);
        });
    });

    describe('and a tree and a list use the same parameter', () => {
        beforeEach(() => {
            render(<>
                <OrgTree element={foundationElement('orgTree', { nodes, urlKey: 'contentsq', expandedDepth: 3 })} slots={{}} />
                <DataList element={foundationElement('dataList', { label: 'Contents', rows, columns, urlKey: 'contents' })} slots={{}} />
            </>);
        });

        it('should narrow the list to the branch that is chosen and everything beneath it', () => {
            fireEvent.click(screen.getByRole('treeitem', { name: /^Warehouse/ }));
            names().should.deep.equal(['Pallet jack', 'Hand truck']);
        });

        it('should keep the chosen branch in the address', () => {
            fireEvent.click(screen.getByRole('treeitem', { name: /Cold store/ }));
            new URLSearchParams(window.location.search).get('contentsq')!.should.equal('Cold store');
        });

        it('should start with the branch the address names selected', () => {
            cleanup();
            window.history.replaceState(null, '', '/?contentsq=Cold%20store');
            render(<>
                <OrgTree element={foundationElement('orgTree', { nodes, urlKey: 'contentsq' })} slots={{}} />
                <DataList element={foundationElement('dataList', { label: 'Contents', rows, columns, urlKey: 'contents' })} slots={{}} />
            </>);
            screen.getByRole('treeitem', { name: /Cold store/ }).getAttribute('aria-selected')!.should.equal('true');
            names().should.deep.equal(['Barcode scanner']);
        });
    });
});
