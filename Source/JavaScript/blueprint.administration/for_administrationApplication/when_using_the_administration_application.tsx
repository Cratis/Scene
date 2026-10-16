// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { Notifications, interactive, provideBrowserApis } from './given';

const sidebar = () => screen.getByRole('navigation', { name: 'Sidebar' });
const topbar = () => screen.getByRole('navigation', { name: 'Modules' });
const labels = (nav: HTMLElement) => Array.from(nav.querySelectorAll('a')).map(item => item.textContent?.trim());
const page = () => document.querySelector('[data-scene-outlet="primary"]')!;
const onPage = () => page().getAttribute('data-scene-screen');
const headings = () => Array.from(page().querySelectorAll('h1')).map(heading => heading.textContent);
const headers = () => Array.from(page().querySelectorAll('th')).map(header => header.textContent!.trim());
const matrixHeaders = () => Array.from(page().querySelectorAll('.foundation-matrix thead th')).map(header => header.textContent);

// Spec Part B 3.7 as an application: the navigation, the screens a user moves between, what the buttons and rows do, and what the data looks like.
describe('when using the Administration application', () => {
    beforeAll(provideBrowserApis);
    // Search, sort, page and selection live in the address, so a test must leave the address as it found it.
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    describe('and it starts on the users', () => {
        beforeEach(() => { render(interactive('admin.users')); });

        it('should name the module in the topbar and show the logo', () => {
            labels(topbar()).should.deep.equal(['Administration']);
            document.querySelector('.layout-logo')!.textContent!.should.contain('Administration');
        });

        it('should list the four places of an administrator in the sidebar', () => labels(sidebar()).should.deep.equal(['Users', 'Roles', 'Settings', 'Audit log']));

        it('should mark the users as the place the user is', () => within(sidebar()).getByText('Users').closest('[aria-current]')!.getAttribute('aria-current')!.should.equal('page'));

        it('should show the users with the columns of the specification', () => headers().should.include.members(['Name', 'Email', 'Role', 'Status', 'Last active']));

        it('should open the invitation dialog from Invite user and close it again from Cancel', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Invite user' }));
            const dialog = screen.getByRole('dialog');
            dialog.getAttribute('data-scene-dialog')!.should.equal('AdministrationInviteUser');
            within(dialog).getByText('Send invitation');
            fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            (screen.queryByRole('dialog') === null).should.equal(true);
        });

        it('should narrow the users as the administrator searches', () => {
            fireEvent.change(screen.getByRole('searchbox', { name: 'Search users' }), { target: { value: 'suspended' } });
            Array.from(page().querySelectorAll('.foundation-table tbody th')).map(cell => cell.textContent).should.deep.equal(['Marcus Webb']);
        });
    });

    describe('and the administrator chooses a user', () => {
        beforeEach(() => {
            render(interactive('admin.users'));
            fireEvent.click(page().querySelector('.foundation-table tbody tr input[type="radio"]')!);
        });

        it('should open the user page with their profile, role assignments and sessions', () => {
            onPage()!.should.equal('admin.users.record');
            headings().should.deep.equal(['Amelia Hart']);
            page().textContent!.should.contain('Role assignments').and.contain('Sessions').and.contain('Chrome on macOS').and.contain('Granted by').and.contain('Open sessions');
            Array.from(page().querySelectorAll('input')).map(input => input.value).should.include.members(['amelia.hart@example.co.uk', 'Head of Operations']);
        });

        it('should offer to sign a session out', () => {
            const actions = page().querySelector('select.foundation-row-actions')!;
            Array.from(actions.querySelectorAll('option')).map(option => option.textContent).should.deep.equal(['Actions', 'Sign out']);
        });
    });

    describe('and the administrator goes to the roles', () => {
        beforeEach(() => { render(interactive('admin.roles')); });

        it('should list the roles with how many people hold each', () => {
            Array.from(page().querySelectorAll('.foundation-table tbody')[0].querySelectorAll('th')).map(cell => cell.textContent).should.deep.equal(['Administrator', 'Manager', 'Editor', 'Viewer', 'Auditor']);
        });

        it('should show every role side by side while none is chosen, so they can be compared', () => {
            matrixHeaders().should.deep.equal(['Permission', 'Administrator', 'Manager', 'Editor', 'Viewer', 'Auditor']);
        });

        it('should show the permissions of the role that is chosen alone, in groups', () => {
            fireEvent.click(within(page() as HTMLElement).getByRole('radio', { name: /Select Editor/ }));
            matrixHeaders().should.deep.equal(['Permission', 'Editor']);
            Array.from(page().querySelectorAll('.foundation-matrix th[scope="colgroup"]')).map(group => group.textContent).should.deep.equal(['Users', 'Roles', 'Settings', 'Audit']);
            const held = Array.from(page().querySelectorAll('.foundation-matrix tbody tr:not(.foundation-matrix-group)')).filter(row => row.querySelector('td')!.getAttribute('data-granted') === 'true').map(row => row.querySelector('th')!.textContent);
            held.should.deep.equal(['View users', 'View roles', 'View settings']);
        });

        it('should grant a permission to the chosen role from its checkbox', () => {
            fireEvent.click(within(page() as HTMLElement).getByRole('radio', { name: /Select Viewer/ }));
            const box = within(page() as HTMLElement).getByRole('checkbox', { name: 'Grant View roles to Viewer' }) as HTMLInputElement;
            box.checked.should.equal(false);
            fireEvent.click(box);
            (within(page() as HTMLElement).getByRole('checkbox', { name: 'Grant View roles to Viewer' }) as HTMLInputElement).checked.should.equal(true);
        });

        it('should keep the chosen role in the address so a link points at it', () => {
            fireEvent.click(within(page() as HTMLElement).getByRole('radio', { name: /Select Auditor/ }));
            new URLSearchParams(window.location.search).get('rolesselected')!.should.equal('auditor');
        });

        it('should open the new role dialog', () => {
            fireEvent.click(screen.getByRole('button', { name: 'New role' }));
            screen.getByRole('dialog').getAttribute('data-scene-dialog')!.should.equal('AdministrationQuickCreateRole');
        });
    });

    describe('and the administrator goes to the settings', () => {
        beforeEach(() => { render(interactive('admin.settings')); });

        it('should show general, branding and notifications, each as its own section', () => {
            Array.from(page().querySelectorAll('fieldset legend, section h2, section h3')).map(title => title.textContent).should.include.members(['General', 'Branding', 'Notifications']);
        });

        it('should show the values the organization has chosen', () => {
            const values = Array.from(page().querySelectorAll('input')).map(input => input.value);
            values.should.include.members(['Cedar & Pine Ltd', '#4f46e5']);
        });

        it('should save one section on its own', () => {
            const saves = within(page() as HTMLElement).getAllByRole('button', { name: /^Save/ });
            saves.length.should.equal(3);
        });
    });

    describe('and the administrator goes to the audit log', () => {
        const notifications: Notifications = [];
        beforeEach(() => { notifications.length = 0; render(interactive('admin.audit', undefined, notifications)); });

        it('should show time, actor, action and target of what happened', () => headers().should.include.members(['Time', 'Actor', 'Action', 'Target']));

        it('should be read only: nothing in it can be selected or changed', () => {
            (page().querySelector('.foundation-table tbody input') === null).should.equal(true);
            (page().querySelector('select.foundation-row-actions') === null).should.equal(true);
        });

        it('should tell the administrator the export has started when Export is pressed', () => {
            fireEvent.click(screen.getByRole('button', { name: 'Export' }));
            notifications.map(notification => notification.message).should.deep.equal(['The export has started.']);
        });
    });
});
