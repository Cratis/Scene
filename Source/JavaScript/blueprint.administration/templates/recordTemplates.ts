// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { AdministrationEntityKind, AdministrationQuery, administrationQueriesOf, fromQuery, localeOfData } from '../administrationQueries';
import { actionButton, administrationMetadata, component, opensDialog, withBehaviors } from '../administrationParts';

const user = administrationQueriesOf(AdministrationEntityKind.User);

/**
 * The user page: the foundation `RecordPage` with the user's name as its title, their status and when they were last active as key facts, their profile as the
 * record, the roles they hold and the sessions they have open as related lists, and what has happened to the account beside them.
 */
export const administrationUserPageTemplate: ScreenTemplate = {
    name: 'AdministrationUserPage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('AdministrationUserPage-header', 'pageHeader', { title: fromQuery(user.record, '0.name'), subtitle: fromQuery(user.record, '0.email') }, {
            actions: [withBehaviors(actionButton('AdministrationUserPage-invite', 'Invite user', 'secondary'), opensDialog('AdministrationInviteUser'))],
        })],
        summary: [
            component('AdministrationUserPage-status', 'statusChip', { status: fromQuery(user.summary, '0.status'), tone: fromQuery(user.summary, '0.tone') }),
            component('AdministrationUserPage-roles', 'statCard', { label: 'Roles', value: fromQuery(user.summary, '0.roles'), ...localeOfData }),
            component('AdministrationUserPage-sessions', 'statCard', { label: 'Open sessions', value: fromQuery(user.summary, '0.sessions'), ...localeOfData }),
            component('AdministrationUserPage-logins', 'statCard', { label: 'Sign-ins this month', value: fromQuery(user.summary, '0.logins'), ...localeOfData }),
        ],
        tabs: [component('AdministrationUserPage-tabs', 'tabSet', { tabs: fromQuery(AdministrationQuery.RecordTabs), urlKey: 'tab', label: 'User sections' })],
        main: [component('AdministrationUserPage-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(user.sections), values: fromQuery(user.record, '0'), ...localeOfData })],
        related: [
            component('AdministrationUserPage-assignments', 'dataList', { label: 'Role assignments', rows: fromQuery(user.roles), columns: fromQuery('AssignmentColumns'), titleField: 'role', ...localeOfData }),
            component('AdministrationUserPage-sessionlist', 'dataList', {
                label: 'Sessions', rows: fromQuery(user.sessions), columns: fromQuery('SessionColumns'), titleField: 'device', rowActions: ['Sign out'], ...localeOfData,
            }),
        ],
        activity: [component('AdministrationUserPage-activity', 'activityFeed', { label: 'Account history', entries: fromQuery(user.activity), ...localeOfData })],
        aside: [],
    },
    displayName: 'Administration user page',
    description: 'One user: profile, role assignments and sessions.',
    metadata: administrationMetadata('AdministrationUserPage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
