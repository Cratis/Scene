// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { masterDetailScreenTemplate } from '@cratis/scene.blueprint.default';
import { AdministrationQuery, fromQuery, localeOfData } from '../administrationQueries';
import { actionButton, administrationMetadata, component, opensDialog, withBehaviors } from '../administrationParts';

/** The list of roles; the permission matrix binds to the row that is chosen in it. */
const rolesId = 'AdministrationRoles-list';

/**
 * Roles and permissions: the foundation `MasterDetail` with the roles on the left - each with how many people hold it - and, on the right, the permission matrix
 * of the role that is chosen. While no role is chosen the matrix shows every role side by side, so roles can be compared before one is picked. The chosen role is
 * kept in the address, so a link points at a role. Granting and revoking are the matrix's own checkboxes, each named in words for a screen reader.
 */
export const administrationRolesTemplate: ScreenTemplate = {
    name: 'AdministrationRoles',
    fitsSlot: 'content',
    slots: masterDetailScreenTemplate.slots,
    arrangement: masterDetailScreenTemplate.arrangement,
    content: {
        list: [
            component('AdministrationRoles-header', 'pageHeader', { title: 'Roles', subtitle: 'Choose a role to see what it may do' }, {
                actions: [withBehaviors(actionButton('AdministrationRoles-new', 'New role', 'primary'), opensDialog('AdministrationQuickCreateRole'))],
            }),
            component(rolesId, 'dataList', {
                label: 'Roles', rows: fromQuery(AdministrationQuery.RoleList), columns: fromQuery(AdministrationQuery.RoleColumns), titleField: 'name', selectionMode: 'single', urlKey: 'roles', ...localeOfData,
            }),
        ],
        details: [component('AdministrationRoles-matrix', 'permissionMatrix', {
            label: 'Permissions', roles: fromQuery(AdministrationQuery.MatrixRoles), permissions: fromQuery(AdministrationQuery.Permissions), grants: fromQuery(AdministrationQuery.Grants), editPermission: 'enabled',
            focusRole: { kind: BindingSourceKind.ComponentProperty, componentId: rolesId, path: 'value' }, ...localeOfData,
        })],
    },
    displayName: 'Administration roles and permissions',
    description: 'The roles on the left and the permission matrix of the chosen role on the right.',
    metadata: administrationMetadata('AdministrationRoles', 'Workspace', [TemplateScope.Module, TemplateScope.Feature]),
};
