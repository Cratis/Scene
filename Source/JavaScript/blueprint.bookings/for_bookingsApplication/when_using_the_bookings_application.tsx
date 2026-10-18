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
describe('when using the Bookings application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on bookings.calendar', () => {
        beforeEach(() => { render(interactive('bookings.calendar')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Bookings']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Bookings');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Calendar', 'Bookings', 'Resources', 'New booking']));
    });

    describe('and the user goes to bookings.calendar', () => {
        beforeEach(() => { render(interactive('bookings.calendar')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('bookings.calendar');
            headings().should.include('Calendar');
            page().textContent!.should.contain('BK-4410').and.contain('Checked in');
        });
    });

    describe('and the user goes to bookings.list', () => {
        beforeEach(() => { render(interactive('bookings.list')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('bookings.list');
            headings().should.include('Bookings');
            page().textContent!.should.contain('BK-4410').and.contain('Fjord meeting room').and.contain('Requested').and.contain('Confirmed');
        });
    });

    describe('and the user goes to bookings.record', () => {
        beforeEach(() => { render(interactive('bookings.record')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('bookings.record');
            headings().should.include('BK-4410');
            page().textContent!.should.contain('Hours').and.contain('Eleanor Marsh').and.contain('Coffee and water').and.contain('confirmed the booking');
        });
    });

    describe('and the user goes to bookings.resources', () => {
        beforeEach(() => { render(interactive('bookings.resources')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('bookings.resources');
            headings().should.include('Resources');
            page().textContent!.should.contain('Fjord meeting room').and.contain('Projector kit').and.contain('Maintenance');
        });
    });

    describe('and the user goes to bookings.new', () => {
        beforeEach(() => { render(interactive('bookings.new')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('bookings.new');
            headings().should.include('New booking');
            page().textContent!.should.contain('Resource').and.contain('When').and.contain('Details').and.contain('Review');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('bookings.list')); });

        it('should open the quick booking dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Quick booking' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('BookingsQuickCreateBooking');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('bookings.list'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('bookings.record');
            headings().should.deep.equal(['BK-4410']);
            page().textContent!.should.contain('Date').and.contain('Hours').and.contain('Eleanor Marsh').and.contain('Projector kit').and.contain('Extras');
        });
    });
});
