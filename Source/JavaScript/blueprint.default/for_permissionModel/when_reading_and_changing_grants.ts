// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isGranted, readGrants, readPermissions, readRoles, sectionsOf, setGrant } from '../foundation';

const roles = readRoles([{ id: 'admin', label: 'Administrator' }, { id: 'admin' }, { label: 'no id' }, { id: 'sales' }]);
const permissions = readPermissions([{ id: 'view', group: 'Deals' }, { id: 'edit', label: 'Edit', group: 'Deals' }, { id: 'users', group: 'Admin' }, { id: 'misc' }, { id: 'view' }]);

describe('when reading and changing grants', () => {
    it('should keep the first of a repeated id and default the label to the id', () => {
        roles.map(role => `${role.id}:${role.label}`).should.deep.equal(['admin:Administrator', 'sales:sales']);
        permissions.map(permission => permission.id).should.deep.equal(['view', 'edit', 'users', 'misc']);
    });

    it('should ignore a grant of a role or a permission that does not exist, and repeats', () => {
        readGrants([{ role: 'admin', permission: 'view' }, { role: 'admin', permission: 'view' }, { role: 'ghost', permission: 'view' }, { role: 'admin', permission: 'gone' }, 'x'], roles, permissions)
            .should.deep.equal([{ role: 'admin', permission: 'view' }]);
    });

    it('should grant and revoke without touching other grants', () => {
        const start = [{ role: 'admin', permission: 'view' }];
        const granted = setGrant(start, 'sales', 'edit', true);
        isGranted(granted, 'sales', 'edit').should.equal(true);
        isGranted(granted, 'admin', 'view').should.equal(true);
        setGrant(granted, 'sales', 'edit', true).should.equal(granted);
        setGrant(granted, 'sales', 'edit', false).should.deep.equal(start);
    });

    it('should group permissions in the order the groups are first seen, ungrouped in a run of their own', () => {
        sectionsOf(permissions).map(section => `${section.group ?? '-'}:${section.permissions.map(permission => permission.id).join(',')}`).should.deep.equal(['Deals:view,edit', 'Admin:users', '-:misc']);
    });
});
