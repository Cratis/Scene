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
describe('when using the Customer portal application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on portal.home', () => {
        beforeEach(() => { render(interactive('portal.home')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Customer portal']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Customer portal');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Home', 'Orders', 'Invoices', 'Support', 'Profile']));
    });

    describe('and the user goes to portal.home', () => {
        beforeEach(() => { render(interactive('portal.home')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('portal.home');
            headings().should.include('Your account');
            page().textContent!.should.contain('Open orders').and.contain('To pay').and.contain('Open requests').and.contain('started picking order SO-1042');
        });
    });

    describe('and the user goes to portal.orders', () => {
        beforeEach(() => { render(interactive('portal.orders')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('portal.orders');
            headings().should.include('Orders');
            page().textContent!.should.contain('SO-1042').and.contain('In progress').and.contain('Delivered').and.contain('Cancelled');
        });
    });

    describe('and the user goes to portal.order', () => {
        beforeEach(() => { render(interactive('portal.order')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('portal.order');
            headings().should.include('SO-1042');
            page().textContent!.should.contain('Order total').and.contain('Days to delivery').and.contain('Pipe cutter, 3-35 mm').and.contain('DHL Freight').and.contain('started picking your order');
        });
    });

    describe('and the user goes to portal.invoices', () => {
        beforeEach(() => { render(interactive('portal.invoices')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('portal.invoices');
            headings().should.include('Invoices');
            page().textContent!.should.contain('INV-2041').and.contain('Overdue').and.contain('Paid');
        });
    });

    describe('and the user goes to portal.support', () => {
        beforeEach(() => { render(interactive('portal.support')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('portal.support');
            headings().should.include('Support');
            page().textContent!.should.contain('Where is my order SO-1038?').and.contain('Invoice INV-2038 is overdue');
        });
    });

    describe('and the user goes to portal.profile', () => {
        beforeEach(() => { render(interactive('portal.profile')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('portal.profile');
            headings().should.include('Grace Hopper');
            page().textContent!.should.contain('Purchasing manager, Northwind Traders').and.contain('changed the default delivery address');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('portal.orders')); });

        it('should open the reorder dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Reorder' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('PortalQuickCreateReorder');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('portal.orders'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('portal.order');
            headings().should.deep.equal(['SO-1042']);
            page().textContent!.should.contain('Order total').and.contain('Days to delivery').and.contain('Compression fitting 22 mm').and.contain('DHL-77120');
        });
    });
});
