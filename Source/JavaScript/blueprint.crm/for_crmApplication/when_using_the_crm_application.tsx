// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { interactive, nordic, provideBrowserApis } from './given';


const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const onPage = () => document.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen');
const headings = () => Array.from(document.querySelectorAll('[data-scene-outlet="primary"] h1')).map(heading => heading.textContent);

// Spec Part B 3.1 as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what each pack's data looks like.
describe('when using the CRM application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the dashboard', () => {
        beforeEach(() => { render(interactive('crm.dashboard')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['CRM']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('CRM');
        });

        it('should list the six places of a sales team in the sidebar', () =>
            labels(sidebar()).should.deep.equal(['Dashboard', 'Leads', 'Contacts', 'Companies', 'Deals', 'Activities']));

        it('should put the pipeline and the list beneath deals once they are opened', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Expand Deals' }));
            labels(sidebar()).should.deep.equal(['Dashboard', 'Leads', 'Contacts', 'Companies', 'Deals', 'Pipeline', 'List', 'Activities']);
        });

        it('should mark the dashboard as the place the user is', () => within(sidebar()).getByText('Dashboard').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));

        it('should show the three key figures, the two charts and the tasks of the user', () => {
            const page = document.querySelector('[data-scene-outlet="primary"]')!;
            Array.from(page.querySelectorAll('.foundation-stat-label')).map(label => label.textContent).should.deep.equal(['Open pipeline value', 'Won this month', 'Conversion rate']);
            page.textContent!.should.contain('Leads by source').and.contain('Deals by stage');
            within(page as HTMLElement).getByRole('region', { name: 'My tasks' });
        });

        it('should format the figures in the currency and the locale of the pack', () => {
            const values = Array.from(document.querySelectorAll('.foundation-stat-value')).map(value => value.textContent!.replace(/\u00a0/g, ' '));
            values.should.deep.equal(['£1,245,000', '£312,000', '24.5%']);
        });
    });

    describe('and the pack is the Norwegian one', () => {
        it('should format the same figures in kroner and the Norwegian number style', () => {
            render(interactive('crm.dashboard', nordic));
            const values = Array.from(document.querySelectorAll('.foundation-stat-value')).map(value => value.textContent!.replace(/[\u00a0\u202f]/g, ' '));
            values.should.deep.equal(['1 245 000 kr', '312 000 kr', '24,5 %']);
        });
    });

    describe('and the user goes to the leads', () => {
        beforeEach(() => { render(interactive('crm.dashboard')); fireEvent.click(within(sidebar()).getByText('Leads')); });

        it('should show the lead list with the columns of the specification', () => {
            onPage()!.should.equal('crm.leads');
            Array.from(document.querySelectorAll('[data-scene-outlet="primary"] th')).map(header => header.textContent!.trim()).should.include.members(['Name', 'Company', 'Owner', 'Status', 'Last contact']);
        });

        it('should offer the row actions edit, assign, convert and delete', () => {
            const page = document.querySelector('[data-scene-outlet="primary"]')!;
            const actions = page.querySelector('.foundation-table tbody tr select.foundation-row-actions')!;
            Array.from(actions.querySelectorAll('option')).map(option => option.textContent).should.deep.equal(['Actions', 'Edit', 'Assign', 'Convert', 'Delete']);
        });

        it('should open the quick-create dialog from New lead and close it again from Cancel', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New lead' }));
            const dialog = screen.getByRole('dialog');
            dialog.getAttribute('data-scene-dialog')!.should.equal('CrmQuickCreateLead');
            within(dialog).getByText('Only what is needed to get started');
            fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });
    });

    describe('and the user goes to the contacts and chooses one', () => {
        beforeEach(() => {
            render(interactive('crm.contacts'));
            fireEvent.click(document.querySelector('[data-scene-outlet="primary"] .foundation-table tbody tr input[type="radio"], [data-scene-outlet="primary"] .foundation-table tbody tr input[type="checkbox"]')!);
        });

        it('should open the contact page with its summary, related deals and activity', () => {
            onPage()!.should.equal('crm.contacts.record');
            const page = document.querySelector('[data-scene-outlet="primary"]')!;
            headings().should.deep.equal(['Freya Collins']);
            page.textContent!.should.contain('Deals of this contact').and.contain('Next steps').and.contain('commented').and.contain('Lifetime value');
        });

        it('should go to the edit form from Edit', () => {
            const edit = Array.from(document.querySelectorAll('[data-scene-outlet="primary"] button')).find(button => button.textContent === 'Edit')!;
            fireEvent.click(edit);
            onPage()!.should.equal('crm.contacts.edit');
            headings().should.deep.equal(['Freya Collins']);
        });
    });

    describe('and the user goes to the pipeline', () => {
        beforeEach(() => { render(interactive('crm.deals')); });

        it('should show a column for each stage with what the stage is worth in its header', () => {
            const totals = Array.from(document.querySelectorAll('.foundation-board-column')).map(column => [column.querySelector('h3')!.textContent, column.querySelector('.foundation-board-total')!.textContent!.replace(/\u00a0/g, ' ')]);
            totals.should.deep.equal([['New', '£114,000'], ['Qualified', '£295,000'], ['Proposal', '£178,500'], ['Negotiation', '£124,000'], ['Won', '£88,000']].map(([stage]) => totals.find(entry => entry[0] === stage)!));
            totals.map(entry => entry[0]).should.deep.equal(['New', 'Qualified', 'Proposal', 'Negotiation', 'Won']);
            totals.every(entry => /^£[0-9,]+$/.test(entry[1]!)).should.equal(true);
        });

        it('should show each deal as a card with its company, value, close date and owner', () => {
            const card = document.querySelector('.foundation-board-card')!;
            card.textContent!.should.contain('Northgate fleet platform').and.contain('Northgate Logistics').and.contain('£48,000').and.contain('Amelia Hart');
        });

        it('should move the value of a deal to the stage it is moved to', () => {
            const total = (stage: string) => Number(Array.from(document.querySelectorAll('.foundation-board-column')).find(column => column.querySelector('h3')!.textContent === stage)!.querySelector('.foundation-board-total')!.getAttribute('data-total'));
            const before = [total('New'), total('Won')];
            fireEvent.change(screen.getByLabelText('Move Northgate fleet platform'), { target: { value: 'won' } });
            [total('New'), total('Won')].should.deep.equal([before[0] - 48000, before[1] + 48000]);
        });
    });

    describe('and the user goes to the deals list', () => {
        it('should group the deals by stage with the value of each stage as its subtotal', () => {
            render(interactive('crm.deals.list'));
            const groups = Array.from(document.querySelectorAll('[data-scene-outlet="primary"] .foundation-list-group')).map(group => group.querySelector('button')!.textContent);
            groups.should.deep.equal(['New', 'Qualified', 'Proposal', 'Negotiation', 'Won']);
            document.querySelector('[data-scene-outlet="primary"] .foundation-list-group .foundation-count')!.textContent!.replace(/\u00a0/g, ' ').should.match(/£[0-9,]+/);
        });
    });
});
