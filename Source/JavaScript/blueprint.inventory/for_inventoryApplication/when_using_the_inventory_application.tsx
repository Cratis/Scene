// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { interactive, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const page = () => document.querySelector('[data-scene-outlet="primary"]')!;
const onPage = () => page().getAttribute('data-scene-screen');
const headings = () => Array.from(page().querySelectorAll('h1')).map(heading => heading.textContent);
const rowNames = () => Array.from(page().querySelectorAll('.foundation-table tbody tr')).map(row => row.querySelector('th')!.textContent);

// Spec Part B 3.4 as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the warehouse data looks like.
describe('when using the Inventory and Assets application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the dashboard', () => {
        beforeEach(() => { render(interactive('inventory.dashboard')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Inventory']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Inventory');
        });

        it('should list the five places of a warehouse in the sidebar', () =>
            labels(sidebar()).should.deep.equal(['Dashboard', 'Items', 'Locations', 'Movements', 'Suppliers']));

        it('should put the table and the gallery beneath items once they are opened', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Expand Items' }));
            labels(sidebar()).should.deep.equal(['Dashboard', 'Items', 'Table', 'Gallery', 'Locations', 'Movements', 'Suppliers']);
        });

        it('should mark the dashboard as the place the user is', () => within(sidebar()).getByText('Dashboard').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));

        it('should show the key figures, the top movers, the recent movements and what to reorder', () => {
            Array.from(page().querySelectorAll('.foundation-stat-label')).map(label => label.textContent).should.deep.equal(['Low stock items', 'Stock value', 'Movements this week']);
            page().textContent!.should.contain('Top movers').and.contain('Recent movements').and.contain('Reorder soon');
        });

        it('should format the stock value in the currency of the pack', () => {
            const values = Array.from(document.querySelectorAll('.foundation-stat-value')).map(value => value.textContent!.replace(/\u00a0/g, ' '));
            values[0].should.equal('6');
            values[1].should.match(/^£[0-9,]+$/);
        });
    });

    describe('and the user goes to the items', () => {
        beforeEach(() => { render(interactive('inventory.dashboard')); fireEvent.click(within(sidebar()).getByText('Items')); });

        it('should show the item list with the columns of the specification', () => {
            onPage()!.should.equal('inventory.items');
            Array.from(page().querySelectorAll('th')).map(header => header.textContent!.trim()).should.include.members(['SKU', 'Name', 'Category', 'Location', 'Quantity', 'Status']);
        });

        it('should highlight the items that are low on stock, and say so in words as well', () => {
            const tinted = Array.from(page().querySelectorAll('.foundation-table tbody tr[data-tone]:not([data-tone=""])'));
            tinted.length.should.be.greaterThan(0);
            tinted.every(row => /Low stock|Out of stock/.test(row.textContent!)).should.equal(true);
        });

        it('should open the adjust stock dialog from the row menu\'s page and close it again from Cancel', () => {
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
            onPage()!.should.equal('inventory.items.record');
            fireEvent.click(screen.getByRole('button', { name: 'Adjust stock' }));
            const dialog = screen.getByRole('dialog');
            dialog.getAttribute('data-scene-dialog')!.should.equal('InventoryAdjustStock');
            within(dialog).getByText('Quantity change');
            fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });

        it('should open the new item dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New item' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('InventoryQuickCreateItem');
        });
    });

    describe('and the user chooses an item', () => {
        beforeEach(() => {
            render(interactive('inventory.items'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the item page with its stock by location, movement history and supplier', () => {
            onPage()!.should.equal('inventory.items.record');
            headings().should.deep.equal(['Pallet jack']);
            page().textContent!.should.contain('Stock by location').and.contain('Movement history').and.contain('On hand').and.contain('Cycle counts');
            Array.from(page().querySelectorAll('input')).map(input => input.value).should.include.members(['EQ-1001', 'Hartley Industrial', 'orders@hartley.example.co.uk']);
        });

        it('should offer check out beside adjusting the stock', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Check out' }));
            onPage()!.should.equal('inventory.movements.check');
        });
    });

    describe('and the user goes to the gallery', () => {
        it('should show every item as a card with its picture and its stock', () => {
            render(interactive('inventory.items.gallery'));
            const cards = page().querySelectorAll('.foundation-card-row');
            cards.length.should.equal(12);
            page().querySelectorAll('.foundation-card-picture img').length.should.equal(12);
            cards[0].textContent!.should.contain('Pallet jack').and.contain('EQ-1001');
        });
    });

    describe('and the user goes to the locations', () => {
        beforeEach(() => { render(interactive('inventory.locations')); });

        it('should show the tree of locations beside everything stored in them', () => {
            within(page() as HTMLElement).getByRole('tree');
            rowNames().length.should.equal(10);
        });

        it('should call the tree what it is and count what is beneath a location', () => {
            within(page() as HTMLElement).getByRole('tree').getAttribute('aria-label')!.should.equal('Locations');
            page().textContent!.should.contain('locations beneath');
        });

        it('should narrow the contents to the location that is chosen and what lies beneath it', () => {
            fireEvent.click(within(page() as HTMLElement).getByRole('treeitem', { name: /Cold store/ }));
            rowNames().should.deep.equal(['Barcode scanner', 'Label printer', 'Thermal labels 100x150', 'Cable ties (100)']);
            fireEvent.click(within(page() as HTMLElement).getByRole('treeitem', { name: /Aisle A/ }));
            rowNames().length.should.equal(6);
        });

        it('should keep the chosen location in the address so a link restores it', () => {
            fireEvent.click(within(page() as HTMLElement).getByRole('treeitem', { name: /Cold store/ }));
            new URLSearchParams(window.location.search).get('contentsq')!.should.equal('Cold store');
        });
    });

    describe('and the user goes to the movements', () => {
        beforeEach(() => { render(interactive('inventory.movements')); });

        it('should show what came in, went out and moved, with nothing selectable', () => {
            Array.from(page().querySelectorAll('th')).map(header => header.textContent!.trim()).should.include.members(['Date', 'Item', 'Type', 'Quantity', 'Location', 'By']);
            (page().querySelector('.foundation-table tbody input') === null).should.equal(true);
        });

        it('should go to check in and out, a single column of fields for a phone', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Check in or out' }));
            onPage()!.should.equal('inventory.movements.check');
            headings().should.deep.equal(['Check in or out']);
            page().textContent!.should.contain('Who has it').and.contain('Due back');
            Array.from(page().querySelectorAll('input')).map(input => input.placeholder).should.include('Scan a barcode or search for an item');
            Array.from(page().querySelectorAll('[data-columns]')).every(section => section.getAttribute('data-columns') === '1').should.equal(true);
        });
    });

    describe('and the user goes to the suppliers', () => {
        it('should list the suppliers and offer to add one', () => {
            render(interactive('inventory.suppliers'));
            Array.from(page().querySelectorAll('th')).map(header => header.textContent!.trim()).should.include.members(['Name', 'Contact', 'Email', 'Items', 'Status']);
            fireEvent.click(screen.getByRole('button', { name: 'New supplier' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('InventoryQuickCreateSupplier');
        });
    });
});
