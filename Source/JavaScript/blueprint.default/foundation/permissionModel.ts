// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A role: a column of the matrix. */
export interface MatrixRole {
    id: string;
    label: string;
}

/** A permission: a row of the matrix, optionally in a named group. */
export interface MatrixPermission {
    id: string;
    label: string;
    group?: string;
}

/** One role holding one permission. */
export interface MatrixGrant {
    role: string;
    permission: string;
}

/** A named run of permissions, for the group heading rows. */
export interface MatrixSection {
    group?: string;
    permissions: MatrixPermission[];
}

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** Reads roles, dropping those without an id and repeated ids. */
export function readRoles(value: unknown): MatrixRole[] {
    const seen = new Set<string>();
    return records(value).flatMap(entry => {
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id)) return [];
        seen.add(entry.id);
        return [{ id: entry.id, label: typeof entry.label === 'string' && entry.label.length > 0 ? entry.label : entry.id }];
    });
}

/** Reads permissions, dropping those without an id and repeated ids. */
export function readPermissions(value: unknown): MatrixPermission[] {
    const seen = new Set<string>();
    return records(value).flatMap(entry => {
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id)) return [];
        seen.add(entry.id);
        return [{ id: entry.id, label: typeof entry.label === 'string' && entry.label.length > 0 ? entry.label : entry.id, ...(typeof entry.group === 'string' && entry.group.length > 0 ? { group: entry.group } : {}) }];
    });
}

/** Reads grants, keeping each pair once and only for a role and a permission that exist: a grant of something that was deleted is not shown as held. */
export function readGrants(value: unknown, roles: MatrixRole[], permissions: MatrixPermission[]): MatrixGrant[] {
    const roleIds = new Set(roles.map(role => role.id));
    const permissionIds = new Set(permissions.map(permission => permission.id));
    const seen = new Set<string>();

    return records(value).flatMap(entry => {
        const { role, permission } = entry;
        if (typeof role !== 'string' || typeof permission !== 'string' || !roleIds.has(role) || !permissionIds.has(permission)) return [];
        const key = `${role}\u0000${permission}`;
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ role, permission }];
    });
}

/** Whether a role holds a permission. */
export const isGranted = (grants: MatrixGrant[], role: string, permission: string): boolean => grants.some(grant => grant.role === role && grant.permission === permission);

/** Grants a permission to a role, or takes it away, leaving every other grant as it was. */
export const setGrant = (grants: MatrixGrant[], role: string, permission: string, granted: boolean): MatrixGrant[] =>
    granted ? (isGranted(grants, role, permission) ? grants : [...grants, { role, permission }]) : grants.filter(grant => !(grant.role === role && grant.permission === permission));

/** Groups the permissions into runs by their group, in the order first seen, with the ungrouped ones in a run of their own. */
export function sectionsOf(permissions: MatrixPermission[]): MatrixSection[] {
    const sections: MatrixSection[] = [];
    for (const permission of permissions) {
        const section = sections.find(candidate => candidate.group === permission.group);
        if (section) section.permissions.push(permission);
        else sections.push({ ...(permission.group === undefined ? {} : { group: permission.group }), permissions: [permission] });
    }

    return sections;
}
