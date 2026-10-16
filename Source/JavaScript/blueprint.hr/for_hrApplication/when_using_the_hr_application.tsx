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
const headers = () => Array.from(page().querySelectorAll('th')).map(header => header.textContent!.trim());
const first = (selector: string) => page().querySelector(selector)!;

// Spec Part B 3.5 as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the Norwegian data looks like.
describe('when using the HR application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the directory', () => {
        beforeEach(() => { render(interactive('hr.directory')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['HR']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('HR');
        });

        it('should list the four places of an HR team in the sidebar', () => labels(sidebar()).should.deep.equal(['Directory', 'Org chart', 'Time off', 'Onboarding']));

        it('should put the requests and the balances beneath time off once it is opened', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Expand Time off' }));
            labels(sidebar()).should.deep.equal(['Directory', 'Org chart', 'Time off', 'Requests', 'Team calendar', 'Balances', 'Onboarding']);
        });

        it('should mark the directory as the place the user is', () => within(sidebar()).getByText('Directory').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));

        it('should show each person as a card with a photo, name, title, department and contact', () => {
            const cards = page().querySelectorAll('.foundation-card-row');
            cards.length.should.equal(12);
            page().querySelectorAll('.foundation-card-picture img').length.should.equal(12);
            cards[0].textContent!.should.contain('Ingrid Solberg').and.contain('Administrerende direktør').and.contain('Ledelse').and.contain('ingrid.solberg@eksempel.no');
        });

        it('should narrow the directory as the user searches', () => {
            fireEvent.change(screen.getByRole('searchbox', { name: 'Search people' }), { target: { value: 'Salg' } });
            page().querySelectorAll('.foundation-card-row').length.should.equal(3);
        });
    });

    describe('and the user chooses a person', () => {
        beforeEach(() => {
            render(interactive('hr.directory'));
            fireEvent.click(first('.foundation-card-row input[type="radio"]'));
        });

        it('should open the employee page with personal and job information, documents and the time-off balance', () => {
            onPage()!.should.equal('hr.directory.record');
            headings().should.deep.equal(['Silje Andersen']);
            page().textContent!.should.contain('Leave left (days)').and.contain('Documents').and.contain('Personlig informasjon').and.contain('Stillingsinformasjon').and.contain('Arbeidsavtale');
            Array.from(page().querySelectorAll('input')).map(input => input.value).should.include.members(['silje.andersen@eksempel.no', 'Seniorutvikler']);
        });

        it('should open the request time off dialog from the page and close it again from Cancel', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Request time off' }));
            const dialog = screen.getByRole('dialog');
            dialog.getAttribute('data-scene-dialog')!.should.equal('HrRequestTimeOff');
            fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });
    });

    describe('and the user goes to the org chart', () => {
        beforeEach(() => { render(interactive('hr.org')); });

        it('should show the company as a tree with the head of the company at the top and what is beneath', () => {
            const tree = within(page() as HTMLElement).getByRole('tree');
            tree.getAttribute('aria-label')!.should.equal('Org chart');
            within(tree).getByRole('treeitem', { name: /Ingrid Solberg/ });
            tree.textContent!.should.contain('Administrerende direktør').and.contain('15 reports');
        });

        it('should keep the chosen person in the address', () => {
            fireEvent.click(within(page() as HTMLElement).getByRole('treeitem', { name: /Magnus Dahl/ }));
            new URLSearchParams(window.location.search).get('person')!.should.equal('emp-2');
        });
    });

    describe('and the user goes to the time off', () => {
        beforeEach(() => { render(interactive('hr.timeoff')); });

        it('should show the requests with their dates in the Norwegian style', () => {
            headers().should.include.members(['Ansatt', 'Type', 'Fra', 'Til', 'Dager', 'Status']);
            first('.foundation-table tbody').textContent!.should.match(/26\. okt\.? 2026/);
        });

        it('should offer a manager the actions on a request', () => {
            const actions = first('.foundation-table tbody tr select.foundation-row-actions');
            Array.from(actions.querySelectorAll('option')).map(option => option.textContent).should.deep.equal(['Actions', 'Approve', 'Decline', 'Cancel']);
        });

        it('should offer to approve or decline many requests at once once some are chosen', () => {
            fireEvent.click(first('.foundation-table tbody tr input[type="checkbox"]'));
            const bar = page().querySelector('.foundation-bulk-bar, [data-scene-id="HrTimeOffList-bulk"]')!;
            bar.textContent!.should.contain('Approve').and.contain('Decline');
        });

        it('should open the request time off dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Request time off' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('HrRequestTimeOff');
        });
    });

    describe('and the user goes to the balances', () => {
        it('should show what each employee has taken and has left, with a progress bar for how much is used', () => {
            render(interactive('hr.timeoff.balances'));
            headers().should.include.members(['Ansatt', 'Avdeling', 'Rett til', 'Tatt ut', 'Igjen', 'Brukt']);
            const bars = Array.from(page().querySelectorAll('progress'));
            bars.length.should.equal(10);
            bars[0].getAttribute('value')!.should.equal('28');
            (page().querySelector('.foundation-table tbody input') === null).should.equal(true);
        });
    });

    describe('and the user goes to the onboarding', () => {
        beforeEach(() => { render(interactive('hr.onboarding')); });

        it('should show the new hires with how far along each is', () => {
            headers().should.include.members(['Navn', 'Stilling', 'Startdato', 'Ansvarlig', 'Fremdrift', 'Status']);
            page().querySelectorAll('progress').length.should.equal(5);
        });

        it('should open the checklist of the hire that is chosen, in sections with an owner and a due date for each task', () => {
            fireEvent.click(first('.foundation-table tbody tr input[type="radio"]'));
            onPage()!.should.equal('hr.onboarding.record');
            headings().should.deep.equal(['Emil Johansen']);
            page().textContent!.should.contain('Før første dag').and.contain('Første uke').and.contain('Første måned').and.match(/Owner:\s+Marte Haugen/).and.contain('Due: 17. sep. 2026');
            Array.from(page().querySelectorAll('input')).map(input => input.value).should.include.members(['Jonas Eriksen', 'Silje Andersen']);
        });
    });
});
