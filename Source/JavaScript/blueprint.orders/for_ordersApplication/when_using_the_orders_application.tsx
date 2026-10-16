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
const columnOf = (label: string) => Array.from(document.querySelectorAll('.foundation-board-column')).find(column => column.querySelector('h3')!.textContent === label)!;
const cardsIn = (label: string) => Array.from(columnOf(label).querySelectorAll('.foundation-board-card strong')).map(title => title.textContent);

// Spec Part B 3.x as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the data looks like.
describe('when using the Orders application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the orders', () => {
        beforeEach(() => { render(interactive('orders.list')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Orders']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Orders');
        });

        it('should list the places of a sales team in the sidebar', () => labels(sidebar()).should.deep.equal(['Orders', 'Fulfilment', 'Deliveries']));

        it('should list the orders newest first with the customer, the total and the status in words', () => {
            const rows = page().querySelectorAll('.foundation-table tbody tr');
            rows.length.should.equal(10);
            rows[0].textContent!.should.contain('SO-1042').and.contain('Northwind Traders').and.contain('Picking');
        });

        it('should open the new order dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New order' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('OrdersQuickCreateOrder');
        });
    });

    describe('and the user chooses an order', () => {
        beforeEach(() => {
            render(interactive('orders.list'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the order page with its key facts, its lines and its shipments', () => {
            onPage()!.should.equal('orders.record');
            headings().should.deep.equal(['SO-1042']);
            page().textContent!.should.contain('Order total').and.contain('Days to delivery').and.contain('Compression fitting 22 mm').and.contain('DHL-77120');
        });
    });

    describe('and the user goes to the fulfilment board', () => {
        beforeEach(() => { render(interactive('orders.fulfilment')); });

        it('should show a column for each step', () => {
            Array.from(document.querySelectorAll('.foundation-board-column h3')).map(heading => heading.textContent).should.deep.equal(['New', 'Picking', 'Shipped', 'Delivered']);
        });

        it('should show each order as a card with its customer, delivery date and channel', () => {
            const card = columnOf('Picking').querySelector('.foundation-board-card')!;
            card.textContent!.should.contain('SO-1042').and.contain('Northwind Traders').and.contain('19 Oct').and.contain('Web');
        });

        it('should move an order to the step it is moved to, announcing it', () => {
            cardsIn('Shipped').should.not.include('SO-1042');
            fireEvent.change(screen.getByLabelText('Move SO-1042'), { target: { value: 'shipped' } });
            cardsIn('Shipped').should.include('SO-1042');
            cardsIn('Picking').should.not.include('SO-1042');
            document.querySelector('[role="status"]')!.textContent!.should.contain('SO-1042');
        });
    });

    describe('and the user goes to the deliveries', () => {
        beforeEach(() => { render(interactive('orders.deliveries')); });

        it('should draw October 2026 with the orders on the day they are due', () => {
            within(page() as HTMLElement).getByRole('heading', { level: 3, name: /october 2026/i });
            within(page() as HTMLElement).getAllByText(/SO-1040/).length.should.be.greaterThan(0);
        });
    });
});
