// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderFoundation, violationsIn } from './given';

const roles = [{ id: 'admin', label: 'Administrator' }, { id: 'editor', label: 'Editor' }, { id: 'viewer', label: 'Viewer' }];
const permissions = [{ id: 'users.read', label: 'View users', group: 'Users' }, { id: 'users.write', label: 'Edit users', group: 'Users' }, { id: 'audit.read', label: 'View the audit log' }];
const grants = [{ role: 'admin', permission: 'users.read' }, { role: 'admin', permission: 'users.write' }, { role: 'editor', permission: 'users.read' }];
const headers = (container: HTMLElement) => Array.from(container.querySelectorAll('thead th')).map(header => header.textContent);

// A matrix beside a list of roles shows the role that is chosen alone, and every role until one is.
describe('when showing one role of the permission matrix', () => {
    afterEach(cleanup);

    it('should show every role while none is named', () => headers(renderFoundation('permissionMatrix', { roles, permissions, grants }).container).should.deep.equal(['Permission', 'Administrator', 'Editor', 'Viewer']));

    it('should show every role when the one named does not exist, rather than nothing', () =>
        headers(renderFoundation('permissionMatrix', { roles, permissions, grants, focusRole: 'ghost' }).container).should.deep.equal(['Permission', 'Administrator', 'Editor', 'Viewer']));

    describe('and a role is named', () => {
        let container: HTMLElement;
        beforeEach(() => { ({ container } = renderFoundation('permissionMatrix', { roles, permissions, grants, focusRole: 'editor', editPermission: 'enabled' })); });

        it('should show that role alone', () => headers(container).should.deep.equal(['Permission', 'Editor']));

        it('should show what that role holds and no other role\'s grants', () => {
            Array.from(container.querySelectorAll('tbody tr:not(.foundation-matrix-group) td')).map(cell => cell.getAttribute('data-granted')).should.deep.equal(['true', 'false', 'false']);
        });

        it('should span the group headings across the one column and the permission column', () => container.querySelector('th[scope="colgroup"]')!.getAttribute('colspan')!.should.equal('2'));

        it('should name each box for the role and the permission', () =>
            Array.from(container.querySelectorAll('input')).map(input => input.getAttribute('aria-label')).should.deep.equal(['Grant View users to Editor', 'Grant Edit users to Editor', 'Grant View the audit log to Editor']));

        it('should leave no accessibility violation', async () => (await violationsIn(container)).should.deep.equal([]));
    });
});
