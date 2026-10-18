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
const columnOf = (label: string) => Array.from(document.querySelectorAll('.foundation-board-column')).find(column => column.querySelector('h3')!.textContent === label)!;
const cardsIn = (label: string) => Array.from(columnOf(label).querySelectorAll('.foundation-board-card strong')).map(title => title.textContent);

// Spec Part B 3.x as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the data looks like.
describe('when using the Vendors application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on vendors.list', () => {
        beforeEach(() => { render(interactive('vendors.list')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Vendors']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Vendors');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Vendors', 'Onboarding', 'Performance']));
    });

    describe('and the user goes to vendors.list', () => {
        beforeEach(() => { render(interactive('vendors.list')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('vendors.list');
            headings().should.include('Vendors');
            page().textContent!.should.contain('Hartwell Supply').and.contain('Materials').and.contain('United Kingdom').and.contain('Suspended');
        });
    });

    describe('and the user goes to vendors.record', () => {
        beforeEach(() => { render(interactive('vendors.record')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('vendors.record');
            headings().should.include('Hartwell Supply');
            page().textContent!.should.contain('Spend this year').and.contain('Eleanor Marsh').and.contain('PO-5521').and.contain('ISO 14001').and.contain('Grace Hopper');
        });
    });

    describe('and the user goes to vendors.onboarding', () => {
        beforeEach(() => { render(interactive('vendors.onboarding')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('vendors.onboarding');
            headings().should.include('Onboarding');
            page().textContent!.should.contain('Pinewood Furniture').and.contain('Atlas Steel').and.contain('Hartwell Supply');
        });
    });

    describe('and the user goes to vendors.performance', () => {
        beforeEach(() => { render(interactive('vendors.performance')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('vendors.performance');
            headings().should.include('Vendor performance');
            page().textContent!.should.contain('Active vendors').and.contain('On-time delivery').and.contain('suspended Bolten Fasteners');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('vendors.list')); });

        it('should open the new vendor dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New vendor' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('VendorsQuickCreateVendor');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('vendors.list'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('vendors.record');
            headings().should.deep.equal(['Hartwell Supply']);
            page().textContent!.should.contain('Spend this year').and.contain('Open orders').and.contain('Eleanor Marsh').and.contain('PO-5521').and.contain('ISO 9001');
        });
    });

    describe('and the user moves a card on vendors.onboarding', () => {
        beforeEach(() => { render(interactive('vendors.onboarding')); });

        it('should show a column for each step', () => {
            Array.from(document.querySelectorAll('.foundation-board-column h3')).map(heading => heading.textContent).should.deep.equal(['Prospect', 'In review', 'Approved', 'Active']);
        });

        it('should move the card to the step it is moved to, announcing it', () => {
            cardsIn('In review').should.not.include('Pinewood Furniture');
            fireEvent.change(screen.getByLabelText('Move Pinewood Furniture'), { target: { value: 'review' } });
            cardsIn('In review').should.include('Pinewood Furniture');
            document.querySelector('[role="status"]')!.textContent!.should.contain('Pinewood Furniture');
        });
    });
});
