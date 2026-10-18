// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { interactive, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const page = () => document.querySelector('[data-scene-outlet="primary"]')!;
const onPage = () => page().getAttribute('data-scene-screen');
const headings = () => Array.from(page().querySelectorAll('h1')).map(heading => heading.textContent);

// Spec Part B 3.x as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the data looks like.
describe('when using the Invoicing application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on invoicing.overview', () => {
        beforeEach(() => { render(interactive('invoicing.overview')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Invoicing']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Invoicing');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Overview', 'Invoices', 'Payments', 'Due dates']));
    });

    describe('and the user goes to invoicing.overview', () => {
        beforeEach(() => { render(interactive('invoicing.overview')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('invoicing.overview');
            headings().should.include('Receivables overview');
            page().textContent!.should.contain('Outstanding').and.contain('Overdue').and.contain('Collected this month').and.contain('chased INV-2038 for payment');
        });
    });

    describe('and the user goes to invoicing.list', () => {
        beforeEach(() => { render(interactive('invoicing.list')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('invoicing.list');
            headings().should.include('Invoices');
            page().textContent!.should.contain('INV-2041').and.contain('Northwind Traders').and.contain('Overdue').and.contain('Paid');
        });
    });

    describe('and the user goes to invoicing.record', () => {
        beforeEach(() => { render(interactive('invoicing.record')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('invoicing.record');
            headings().should.include('INV-2041');
            page().textContent!.should.contain('Invoice total').and.contain('Balance due').and.contain('Pipe cutter, 3-35 mm').and.contain('No payment yet').and.contain('Katherine Johnson');
        });
    });

    describe('and the user goes to invoicing.payments', () => {
        beforeEach(() => { render(interactive('invoicing.payments')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('invoicing.payments');
            headings().should.include('Payments');
            page().textContent!.should.contain('PAY-3318').and.contain('INV-2036').and.contain('Bank transfer');
        });
    });

    describe('and the user goes to invoicing.due', () => {
        beforeEach(() => { render(interactive('invoicing.due')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('invoicing.due');
            headings().should.include('Due dates');
            page().textContent!.should.contain('INV-2038').and.contain('Overdue');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('invoicing.list')); });

        it('should open the new invoice dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New invoice' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('InvoicingQuickCreateInvoice');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('invoicing.list'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('invoicing.record');
            headings().should.deep.equal(['INV-2041']);
            page().textContent!.should.contain('Invoice total').and.contain('Balance due').and.contain('Compression fitting 22 mm').and.contain('Freight to Bergen');
        });
    });
});
