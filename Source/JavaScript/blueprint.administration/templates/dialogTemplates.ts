// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, TemplateScope } from '@cratis/scene.model';
import { quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { AdministrationQuery, fromQuery, localeOfData } from '../administrationQueries';
import { administrationMetadata, closesDialog, component, withBehaviors } from '../administrationParts';

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, subtitle: string, sections: string, noun: string, create: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: create }, sections: fromQuery(sections), errors: fromQuery(AdministrationQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `Administration quick create ${noun}`,
        description: noun === 'invitation' ? 'A short form that invites someone by email with a role, without leaving the page.' : `A short form that creates one ${noun} without leaving the page.`,
        metadata: administrationMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** Invite a user (an email, a role and a message), and the quick creation of a role. */
export const administrationDialogs: DialogTemplate[] = [
    quickCreateOf('AdministrationInviteUser', 'Invite a user', 'They will get an email with a link to join', 'InviteSections', 'invitation', 'Send invitation'),
    quickCreateOf('AdministrationQuickCreateRole', 'New role', 'Choose its permissions afterwards', 'RoleQuickSections', 'role', 'Create'),
];
