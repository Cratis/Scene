// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { german, interactive, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const outlet = () => document.querySelector('[data-scene-outlet="primary"]')!;
const onPage = () => outlet().getAttribute('data-scene-screen');
const headings = () => Array.from(outlet().querySelectorAll('h1')).map(heading => heading.textContent);
const buttonNamed = (name: string) => Array.from(outlet().querySelectorAll('button')).find(button => button.textContent === name)!;

// Spec Part B 3.2 as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what each pack's data looks like.
describe('when using the help desk application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the dashboard', () => {
        beforeEach(() => { render(interactive('support.dashboard')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Support']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Support');
        });

        it('should list the five places of a support team in the sidebar', () =>
            labels(sidebar()).should.deep.equal(['Dashboard', 'Queue', 'My tickets', 'Customers', 'Knowledge base']));

        it('should put the list and the board beneath the queue once it is opened', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Expand Queue' }));
            labels(sidebar()).should.deep.equal(['Dashboard', 'Queue', 'List', 'Board', 'My tickets', 'Customers', 'Knowledge base']);
        });

        it('should mark the dashboard as the place the user is', () => within(sidebar()).getByText('Dashboard').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));

        it('should show open, overdue and the average first response, then tickets by priority and by assignee', () => {
            Array.from(outlet().querySelectorAll('.foundation-stat-label')).map(label => label.textContent).should.deep.equal(['Open tickets', 'Overdue', 'Average first response (hours)']);
            outlet().textContent!.should.contain('Open tickets by priority').and.contain('Open tickets by assignee').and.contain('Overdue tickets');
            within(outlet() as HTMLElement).getByRole('region', { name: 'My next steps' });
        });

        it('should format the average response in the locale of the pack', () =>
            Array.from(outlet().querySelectorAll('.foundation-stat-value')).map(value => value.textContent!.replace(/\u00a0/g, ' '))[2].should.equal('2.4'));
    });

    describe('and the pack is the German one', () => {
        it('should format the same figure in the German number style', () => {
            render(interactive('support.dashboard', german));
            Array.from(outlet().querySelectorAll('.foundation-stat-value')).map(value => value.textContent!.replace(/\u00a0/g, ' '))[2].should.equal('2,4');
        });
    });

    describe('and the user goes to the queue', () => {
        beforeEach(() => { render(interactive('support.dashboard')); fireEvent.click(within(sidebar()).getByText('Queue')); });

        it('should show the columns of the specification', () => {
            onPage()!.should.equal('support.queue');
            Array.from(outlet().querySelectorAll('th')).map(header => header.textContent!.trim()).should.include.members(['ID', 'Subject', 'Requester', 'Priority', 'Status', 'Assignee', 'Age']);
        });

        it('should draw priority and status as chips that say the word', () => {
            const row = outlet().querySelector('.foundation-table tbody tr')!;
            Array.from(row.querySelectorAll('.foundation-chip')).map(chip => chip.textContent).should.include.members(['Urgent', 'New']);
        });

        it('should offer the saved views Unassigned, Mine and Overdue', () => {
            fireEvent.click(within(outlet() as HTMLElement).getByRole('button', { name: /Saved views/ }));
            ['Unassigned', 'Mine', 'Overdue'].forEach(view => within(outlet() as HTMLElement).getAllByText(view).length.should.be.greaterThan(0));
        });

        it('should open the quick-create dialog from New ticket and close it again from Cancel', () => {
            fireEvent.click(buttonNamed('New ticket'));
            const dialog = screen.getByRole('dialog');
            dialog.getAttribute('data-scene-dialog')!.should.equal('TicketQuickCreate');
            fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });

        it('should open the ticket when a row is chosen, with its conversation, properties and quick actions', () => {
            fireEvent.click(outlet().querySelector('.foundation-table tbody tr input')!);
            onPage()!.should.equal('support.queue.ticket');
            headings().should.deep.equal(['Invoice PDF shows the wrong VAT number']);
            outlet().textContent!.should.contain('Conversation').and.contain('Properties').and.contain('Thanks Isla');
            ['Assign', 'Change status', 'Escalate', 'Merge'].forEach(action => (buttonNamed(action) !== undefined).should.equal(true));
        });
    });

    describe('and the user is on a ticket', () => {
        beforeEach(() => {
            render(interactive('support.queue'));
            fireEvent.click(outlet().querySelector('.foundation-table tbody tr input')!);
        });

        for (const [action, dialog] of [['Assign', 'AssignTicket'], ['Change status', 'ChangeTicketStatus'], ['Escalate', 'EscalateTicket'], ['Merge', 'MergeTickets']]) {
            it(`should open the ${dialog} dialog from ${action} and close it from Cancel`, () => {
                fireEvent.click(buttonNamed(action));
                const open = screen.getByRole('dialog');
                open.getAttribute('data-scene-dialog')!.should.equal(dialog);
                fireEvent.click(within(open).getByRole('button', { name: 'Cancel' }));
                (screen.queryByRole('dialog') === null).should.equal(true);
            });
        }
    });

    describe('and the user goes to the board', () => {
        beforeEach(() => { render(interactive('support.queue.board')); });

        it('should show a column for each status', () => {
            Array.from(document.querySelectorAll('.foundation-board-column h3')).map(heading => heading.textContent).should.deep.equal(['New', 'Open', 'Pending', 'Resolved']);
        });

        it('should show each ticket as a card with its subject, requester, age and priority', () => {
            const card = document.querySelector('.foundation-board-card')!;
            card.textContent!.should.contain('Cannot sign in after password reset').and.contain('Isla Morgan').and.contain('Urgent');
        });

        it('should move a ticket to the column it is moved to', () => {
            const count = (status: string) => Array.from(document.querySelectorAll('.foundation-board-column')).find(column => column.querySelector('h3')!.textContent === status)!.querySelectorAll('.foundation-board-card').length;
            const before = [count('New'), count('Resolved')];
            fireEvent.change(screen.getByLabelText('Move Cannot sign in after password reset'), { target: { value: 'Resolved' } });
            [count('New'), count('Resolved')].should.deep.equal([before[0] - 1, before[1] + 1]);
        });
    });

    describe('and the user goes to the knowledge base', () => {
        beforeEach(() => { render(interactive('support.knowledge')); });

        it('should show the categories and articles as a tree beside the article', () => {
            const tree = within(outlet() as HTMLElement).getByRole('tree');
            ['Accounts', 'Billing', 'Devices'].forEach(category => within(tree).getByText(category));
            outlet().textContent!.should.contain('Reset a password').and.contain('Forgot password');
        });

        it('should offer a way to the public form from Still need help', () => {
            fireEvent.click(buttonNamed('Still need help?'));
            onPage()!.should.equal('support.queue.portal');
            headings().should.deep.equal(['Contact support']);
        });
    });

    describe('and a customer opens the public form', () => {
        beforeEach(() => { render(interactive('support.queue.portal')); });

        it('should show it without the application chrome, in the full-page layout', () => {
            (document.querySelector('nav[aria-label="Sidebar"]') === null).should.equal(true);
            headings().should.deep.equal(['Contact support']);
        });

        it('should say what happens next and ask for only what a customer can say', () => {
            outlet().textContent!.should.contain('What happens next').and.contain('Your name').and.contain('What is wrong?');
            outlet().textContent!.should.not.contain('Assignee');
        });
    });
});
