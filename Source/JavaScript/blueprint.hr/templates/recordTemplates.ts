// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { HrEntityKind, HrQuery, fromQuery, hrQueriesOf, localeOfData } from '../hrQueries';
import { actionButton, component, hrMetadata, opensDialog, withBehaviors } from '../hrParts';

const employee = hrQueriesOf(HrEntityKind.Employee);
const onboarding = hrQueriesOf(HrEntityKind.Onboarding);

/**
 * The employee page: the foundation `RecordPage` with the employee's name as its title, the time-off balance as key facts under it, the personal and job
 * information as the record, the employee's documents and time-off requests as related lists, their history and the open tasks beside it.
 */
export const hrEmployeePageTemplate: ScreenTemplate = {
    name: 'HrEmployeePage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('HrEmployeePage-header', 'pageHeader', { title: fromQuery(employee.record, '0.name'), subtitle: fromQuery(employee.record, '0.title') }, {
            actions: [withBehaviors(actionButton('HrEmployeePage-timeoff', 'Request time off', 'primary'), opensDialog('HrRequestTimeOff'))],
        })],
        summary: [
            component('HrEmployeePage-status', 'statusChip', { status: fromQuery(employee.summary, '0.status'), tone: fromQuery(employee.summary, '0.tone') }),
            component('HrEmployeePage-left', 'statCard', { label: 'Leave left (days)', value: fromQuery(employee.summary, '0.leaveLeft'), ...localeOfData }),
            component('HrEmployeePage-taken', 'statCard', { label: 'Leave taken (days)', value: fromQuery(employee.summary, '0.leaveTaken'), ...localeOfData }),
            component('HrEmployeePage-service', 'statCard', { label: 'Years of service', value: fromQuery(employee.summary, '0.years'), ...localeOfData }),
            component('HrEmployeePage-team', 'avatarStack', { people: fromQuery(employee.summary, '0.people') }),
        ],
        tabs: [component('HrEmployeePage-tabs', 'tabSet', { tabs: fromQuery(HrQuery.RecordTabs), urlKey: 'tab', label: 'Employee sections' })],
        main: [component('HrEmployeePage-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(employee.sections), values: fromQuery(employee.record, '0'), ...localeOfData })],
        related: [
            component('HrEmployeePage-documents', 'dataList', { label: 'Documents', rows: fromQuery(employee.documents), columns: fromQuery('DocumentColumns'), titleField: 'name', pageSize: 5, ...localeOfData }),
            component('HrEmployeePage-requests', 'dataList', {
                label: 'Time off', rows: fromQuery('EmployeeTimeOff'), columns: fromQuery(hrQueriesOf(HrEntityKind.TimeOff).columns), titleField: 'employee', pageSize: 5, ...localeOfData,
            }),
        ],
        activity: [component('HrEmployeePage-activity', 'activityFeed', { label: 'History', entries: fromQuery(employee.activity), ...localeOfData })],
        aside: [component('HrEmployeePage-tasks', 'checklistSection', { label: 'Open tasks', sections: fromQuery(employee.tasks), ...localeOfData })],
    },
    displayName: 'HR employee page',
    description: 'One employee: personal and job information, documents and time-off balance.',
    metadata: hrMetadata('HrEmployeePage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};

/**
 * The onboarding checklist: a `RecordPage` variant for one new hire. Where an ordinary record page leads with the record's fields, this one leads with the checklist -
 * sections of tasks (before the first day, the first week, the first month), each task with an owner and a due date and a way to tick it off - and keeps the
 * key facts of the hire (start date, manager, buddy, equipment) beside it.
 */
export const hrOnboardingChecklistTemplate: ScreenTemplate = {
    name: 'HrOnboardingChecklist',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('HrOnboardingChecklist-header', 'pageHeader', { title: fromQuery(onboarding.record, '0.name'), subtitle: 'Onboarding checklist' })],
        summary: [
            component('HrOnboardingChecklist-status', 'statusChip', { status: fromQuery(onboarding.summary, '0.status'), tone: fromQuery(onboarding.summary, '0.tone') }),
            component('HrOnboardingChecklist-done', 'statCard', { label: 'Tasks done', value: fromQuery(onboarding.summary, '0.done'), ...localeOfData }),
            component('HrOnboardingChecklist-open', 'statCard', { label: 'Tasks open', value: fromQuery(onboarding.summary, '0.open'), ...localeOfData }),
            component('HrOnboardingChecklist-owners', 'avatarStack', { people: fromQuery(onboarding.summary, '0.people') }),
        ],
        tabs: [],
        main: [component('HrOnboardingChecklist-tasks', 'checklistSection', { label: 'Onboarding tasks', sections: fromQuery(onboarding.tasks), editPermission: 'enabled', ...localeOfData })],
        related: [],
        activity: [component('HrOnboardingChecklist-activity', 'activityFeed', { label: 'History', entries: fromQuery(onboarding.activity), ...localeOfData })],
        aside: [component('HrOnboardingChecklist-facts', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(onboarding.sections), values: fromQuery(onboarding.record, '0'), ...localeOfData })],
    },
    displayName: 'HR onboarding checklist',
    description: 'One new hire\'s onboarding: checklist sections with an owner and a due date for each task, and the key facts of the hire.',
    metadata: hrMetadata('HrOnboardingChecklist', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
