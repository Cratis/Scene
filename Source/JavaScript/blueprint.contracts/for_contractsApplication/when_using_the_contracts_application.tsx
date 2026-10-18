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
describe('when using the Contracts application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on contracts.list', () => {
        beforeEach(() => { render(interactive('contracts.list')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Contracts']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Contracts');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Contracts', 'Timeline', 'Needs attention']));
    });

    describe('and the user goes to contracts.list', () => {
        beforeEach(() => { render(interactive('contracts.list')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('contracts.list');
            headings().should.include('Contracts');
            page().textContent!.should.contain('CT-2026-014').and.contain('Hartwell Supply').and.contain('Expiring').and.contain('Expired');
        });
    });

    describe('and the user goes to contracts.record', () => {
        beforeEach(() => { render(interactive('contracts.record')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('contracts.record');
            headings().should.include('CT-2026-014');
            page().textContent!.should.contain('Contract value').and.contain('Cratis Trading Ltd').and.contain('Delivery within five working days').and.contain('New price list').and.contain('asked for a price review before renewal');
        });
    });

    describe('and the user goes to contracts.timeline', () => {
        beforeEach(() => { render(interactive('contracts.timeline')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('contracts.timeline');
            headings().should.include('Timeline');
            page().textContent!.should.contain('Hartwell Supply').and.contain('Notice date: Freight and warehousing');
        });
    });

    describe('and the user goes to contracts.review', () => {
        beforeEach(() => { render(interactive('contracts.review')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('contracts.review');
            headings().should.include('Needs attention');
            page().textContent!.should.contain('Review: Mutual non-disclosure with Atlas Steel').and.contain('Signature: Pilot with Solstice Energy');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('contracts.list')); });

        it('should open the new contract dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New contract' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('ContractsQuickCreateContract');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('contracts.list'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('contracts.record');
            headings().should.deep.equal(['CT-2026-014']);
            page().textContent!.should.contain('Contract value').and.contain('Days to end').and.contain('Eleanor Marsh').and.contain('Quarterly price review').and.contain('Amendment 2');
        });
    });
});
