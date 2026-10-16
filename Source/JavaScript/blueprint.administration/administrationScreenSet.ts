// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`admin.users.record` is the `record` feature of `users` in the `admin` module). */
export interface AdministrationScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const administrationScreenDefinitions: AdministrationScreenDefinition[] = [
    { name: 'admin.users', title: 'Users', template: 'AdministrationUserList', order: 0, description: 'Everyone with an account: role, status and when they were last active; invite someone.' },
    { name: 'admin.users.record', title: 'User', template: 'AdministrationUserPage', parent: 'admin.users', description: 'One user: profile, role assignments and sessions.' },
    { name: 'admin.roles', title: 'Roles and permissions', template: 'AdministrationRoles', order: 1, description: 'The roles on the left and what the chosen role may do on the right.' },
    { name: 'admin.settings', title: 'Settings', template: 'AdministrationSettings', order: 2, description: 'General, branding and notification settings of the organization.' },
    { name: 'admin.audit', title: 'Audit log', template: 'AdministrationAuditLog', order: 3, description: 'Who did what to what and when, read only; filtered and exported.' },
];
