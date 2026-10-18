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
describe('when using the Work orders application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on workorders.list', () => {
        beforeEach(() => { render(interactive('workorders.list')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Work orders']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Work orders');
        });

        it('should list the places of the blueprint in the sidebar', () => labels(sidebar()).should.deep.equal(['Work orders', 'Board', 'Schedule']));
    });

    describe('and the user goes to workorders.list', () => {
        beforeEach(() => { render(interactive('workorders.list')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('workorders.list');
            headings().should.include('Work orders');
            page().textContent!.should.contain('WO-3108').and.contain('Bergen depot').and.contain('Urgent').and.contain('On hold');
        });
    });

    describe('and the user goes to workorders.record', () => {
        beforeEach(() => { render(interactive('workorders.record')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('workorders.record');
            headings().should.include('WO-3108');
            page().textContent!.should.contain('Priority').and.contain('Days to due date').and.contain('Fit the new valve').and.contain('PTFE tape').and.contain('ordered the replacement valve');
        });
    });

    describe('and the user goes to workorders.board', () => {
        beforeEach(() => { render(interactive('workorders.board')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('workorders.board');
            headings().should.include('Board');
            page().textContent!.should.contain('WO-3108').and.contain('WO-3101');
        });
    });

    describe('and the user goes to workorders.schedule', () => {
        beforeEach(() => { render(interactive('workorders.schedule')); });

        it('should show the screen with its heading and what the data says', () => {
            onPage()!.should.equal('workorders.schedule');
            headings().should.include('Schedule');
            page().textContent!.should.contain('WO-3108').and.contain('In progress');
        });
    });

    describe('and the user starts a new record', () => {
        beforeEach(() => { render(interactive('workorders.list')); });

        it('should open the new work order dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New work order' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('WorkOrdersQuickCreateWorkOrder');
        });
    });

    describe('and the user chooses a row', () => {
        beforeEach(() => {
            render(interactive('workorders.list'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the record page with its key facts', () => {
            onPage()!.should.equal('workorders.record');
            headings().should.deep.equal(['WO-3108']);
            page().textContent!.should.contain('Priority').and.contain('Hours logged').and.contain('Isolate the boiler').and.contain('Pressure relief valve 3/4 inch').and.contain('Time logged');
        });
    });

    describe('and the user moves a card on workorders.board', () => {
        beforeEach(() => { render(interactive('workorders.board')); });

        it('should show a column for each step', () => {
            Array.from(document.querySelectorAll('.foundation-board-column h3')).map(heading => heading.textContent).should.deep.equal(['New', 'Scheduled', 'In progress', 'Done']);
        });

        it('should move the card to the step it is moved to, announcing it', () => {
            cardsIn('Scheduled').should.not.include('WO-3105');
            fireEvent.change(screen.getByLabelText('Move WO-3105'), { target: { value: 'scheduled' } });
            cardsIn('Scheduled').should.include('WO-3105');
            document.querySelector('[role="status"]')!.textContent!.should.contain('WO-3105');
        });
    });
});
