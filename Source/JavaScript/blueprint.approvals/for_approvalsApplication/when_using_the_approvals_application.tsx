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

// Spec Part B 3.3 as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what each pack's data looks like.
describe('when using the approvals application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the inbox', () => {
        beforeEach(() => { render(interactive('approvals.inbox')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Approvals']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Approvals');
        });

        it('should list the four places in the sidebar', () => labels(sidebar()).should.deep.equal(['Inbox', 'My requests', 'All requests', 'Templates']));

        it('should mark the inbox as the place the user is', () => within(sidebar()).getByText('Inbox').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));

        it('should show the requests waiting as cards, not as a table', () => {
            outlet().querySelectorAll('.foundation-cards').length.should.equal(1);
            outlet().querySelectorAll('.foundation-table').length.should.equal(0);
        });

        it('should put Approve, Reject and Request changes on each card as buttons that name their request', () => {
            const first = outlet().querySelector('.foundation-card-row')!;
            const group = first.querySelector('.foundation-row-buttons')!;
            Array.from(group.querySelectorAll('button')).map(button => button.textContent).should.deep.equal(['Approve', 'Reject', 'Request changes']);
            Array.from(group.querySelectorAll('button')).every(button => /: /.test(button.getAttribute('aria-label')!)).should.equal(true);
        });

        it('should open the decision dialog from a decision and close it from Cancel', () => {
            fireEvent.click(within(outlet().querySelector('.foundation-card-row') as HTMLElement).getByRole('button', { name: /^Approve:/ }));
            const dialog = screen.getByRole('dialog');
            dialog.getAttribute('data-scene-dialog')!.should.equal('DecisionDialog');
            within(dialog).getByText('Your decision');
            fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });
    });

    describe('and the pack is the Norwegian one', () => {
        it('should say the same things in Norwegian and format the amounts in kroner', () => {
            render(interactive('approvals.inbox', german));
            const card = outlet().querySelector('.foundation-card-row')!;
            card.textContent!.replace(/[\u00a0\u202f]/g, ' ').should.contain('kr').and.not.contain('£');
        });
    });

    describe('and the user goes to my requests', () => {
        beforeEach(() => { render(interactive('approvals.inbox')); fireEvent.click(within(sidebar()).getByText('My requests')); });

        it('should show the columns and the status as chips that say the word', () => {
            onPage()!.should.equal('approvals.requests');
            Array.from(outlet().querySelectorAll('th')).map(header => header.textContent!.trim()).should.include.members(['ID', 'Request', 'Status', 'Approver', 'Amount', 'Submitted']);
            const chips = Array.from(outlet().querySelectorAll('.foundation-table tbody .foundation-chip')).map(chip => chip.textContent);
            chips.should.include.members(['Submitted', 'Approved', 'Draft', 'Rejected']);
        });

        it('should start the wizard from New request', () => {
            fireEvent.click(buttonNamed('New request'));
            onPage()!.should.equal('approvals.requests.new');
            headings().should.deep.equal(['New request']);
        });

        it('should open the request page when a request is chosen, with its approval chain and comments', () => {
            fireEvent.click(outlet().querySelector('.foundation-table tbody tr input')!);
            onPage()!.should.equal('approvals.requests.page');
            headings().length.should.equal(1);
            outlet().textContent!.should.contain('Waiting for a decision').and.contain('Awaiting decision').and.contain('Step 1 of 3').and.contain('Attachments').and.contain('asked a question');
            within(outlet() as HTMLElement).getByRole('list', { name: 'Approval chain' });
            ['Approve', 'Reject', 'Request changes'].forEach(action => (buttonNamed(action) !== undefined).should.equal(true));
        });
    });

    describe('and the user makes a new request', () => {
        beforeEach(() => { render(interactive('approvals.requests.new')); });

        it('should list the four steps and start on the request type', () => {
            const steps = Array.from(outlet().querySelectorAll('.foundation-wizard-steps li')).map(step => step.textContent!.replace(/\s+/g, ' ').trim());
            steps.length.should.equal(4);
            ['Request type', 'Details', 'Attachments', 'Review and submit'].forEach((label, index) => steps[index].should.contain(label));
            outlet().textContent!.should.contain('The type decides');
        });

        it('should move to the details and then the attachments with Next, and offer Back', () => {
            fireEvent.click(buttonNamed('Next'));
            outlet().textContent!.should.contain('Reason');
            fireEvent.click(buttonNamed('Next'));
            (outlet().querySelector('input[type="file"]') !== null).should.equal(true);
            (buttonNamed('Back') !== undefined).should.equal(true);
        });
    });

    describe('and the user goes to all requests and the templates', () => {
        it('should show every request with its current approver', () => {
            render(interactive('approvals.all'));
            Array.from(outlet().querySelectorAll('th')).map(header => header.textContent!.trim()).should.include.members(['Current approver']);
        });

        it('should show the request types and open the editor from one', () => {
            render(interactive('approvals.templates'));
            outlet().textContent!.should.contain('Leave').and.contain('Expense').and.contain('Purchase').and.contain('Travel').and.contain('Invoice approval');
            fireEvent.click(outlet().querySelector('.foundation-table tbody tr input')!);
            onPage()!.should.equal('approvals.templates.edit');
            headings().should.deep.equal(['Edit request type']);
        });

        it('should open the new request type dialog from New request type', () => {
            render(interactive('approvals.templates'));
            fireEvent.click(buttonNamed('New request type'));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('RequestTypeQuickCreate');
        });
    });
});
