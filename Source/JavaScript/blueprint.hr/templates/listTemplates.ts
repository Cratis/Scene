// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { listScreenTemplate } from '@cratis/scene.blueprint.default';
import { HrEntityKind, fromQuery, hrQueriesOf, localeOfData } from '../hrQueries';
import { actionButton, component, goesTo, hrMetadata, opensDialog, opensRecordOnSelect, withBehaviors } from '../hrParts';

const listScopes = [TemplateScope.Module, TemplateScope.Feature];

/** The Export button: it tells the user the export has started, which is what the shell does for a long-running action it does not wait on. */
const exportAction = (id: string) => withBehaviors(actionButton(id, 'Export', 'secondary'), [{
    bindings: [{
        trigger: { kind: InteractionTriggerKind.Click },
        actions: [{ kind: InteractionActionKind.Notify, level: NotificationLevel.Info, message: { text: 'The export has started.' } } as unknown as NotifyAction],
    }],
}]);

interface ListOptions {
    name: string;
    entity: HrEntityKind;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    urlKey: string;
    /** The primary action of the header: a quick-create dialog to open, or a screen to go to. */
    primary: { label: string; dialog?: string; screen?: string };
    rowActions: string[];
    bulkActions: string[];
    titleField: string;
    /** The screen a chosen row opens; the list then selects one row at a time. Absent, rows are selected many at a time for the bulk bar. */
    recordScreen?: string;
    /** Rows are not selectable at all: a record of what happened, which nobody edits. */
    readOnly?: boolean;
    /** Show the records as cards, each with the picture its `imageField` names. */
    cards?: { imageField: string };
    /** Tint a row by the tone in this field (always beside a status column that says the same in words). */
    toneField?: string;
}

/**
 * One HR list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled for an entity. The slots, arrangement and
 * every behavior - sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const queries = hrQueriesOf(options.entity);
    const id = options.name;
    const listId = `${id}-records`;
    const primary = withBehaviors(actionButton(`${id}-primary`, options.primary.label, 'primary'), options.primary.dialog ? opensDialog(options.primary.dialog) : goesTo(options.primary.screen!));
    const list = component(listId, 'dataList', {
        label: options.title, rows: fromQuery(queries.rows), columns: fromQuery(queries.columns), titleField: options.titleField, pageSize: options.cards ? 12 : 10, urlKey: options.urlKey, ...localeOfData,
        rowActions: options.rowActions,
        ...(options.readOnly ? {} : { selectionMode: options.recordScreen ? 'single' : 'multiple' }),
        ...(options.cards ? { variant: 'cards', imageField: options.cards.imageField } : {}),
        ...(options.toneField ? { toneField: options.toneField } : {}),
    });

    return {
        name: options.name,
        fitsSlot: 'content',
        slots: listScreenTemplate.slots,
        arrangement: listScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, { actions: [exportAction(`${id}-export`), primary] })],
            toolbar: [
                component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel, urlKey: `${options.urlKey}q` }),
                component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(queries.views), savePermission: 'enabled', managePermission: 'enabled' }),
                component(`${id}-columns`, 'columnChooser', { columns: fromQuery(queries.columnChoices) }),
            ],
            filters: [component(`${id}-filter`, 'filterBuilder', { fields: fromQuery(queries.filterFields), ...localeOfData })],
            list: [options.recordScreen ? withBehaviors(list, opensRecordOnSelect(listId, options.recordScreen)) : list],
            bulkBar: options.recordScreen || options.readOnly ? [] : [component(`${id}-bulk`, 'bulkBar', { selection: fromQuery(queries.selection), actions: options.bulkActions })],
            footer: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: hrMetadata(options.name, 'List', listScopes),
    };
}

/** The directory: everyone in the company as cards - photo, name, title, department and how to reach them. Choosing a card opens the employee. */
export const hrEmployeeDirectoryTemplate = listTemplateOf({
    name: 'HrEmployeeDirectory', entity: HrEntityKind.Employee, displayName: 'HR employee directory', description: 'Employees as cards with photo, name, title, department and contact, filtered by department, location and status.',
    title: 'Directory', subtitle: 'Everyone in the company', searchLabel: 'Search people', urlKey: 'people', primary: { label: 'New employee', dialog: 'HrQuickCreateEmployee' },
    rowActions: ['View profile', 'Send email'], bulkActions: [], titleField: 'name', recordScreen: 'hr.directory.record', cards: { imageField: 'photo' },
});

/** The time-off requests: who asked for what and when, with the actions a manager takes on one or many at once. */
export const hrTimeOffListTemplate = listTemplateOf({
    name: 'HrTimeOffList', entity: HrEntityKind.TimeOff, displayName: 'HR time off', description: 'Time-off requests with the employee, type, dates, days and status, filtered by type, status and period.',
    title: 'Time off', subtitle: 'Requests to approve and who is away', searchLabel: 'Search requests', urlKey: 'timeoff', primary: { label: 'Request time off', dialog: 'HrRequestTimeOff' },
    rowActions: ['Approve', 'Decline', 'Cancel'], bulkActions: ['Approve', 'Decline'], titleField: 'employee',
});

/** The balances: what each employee is entitled to, has taken and has left, with how much of the year is used. Read only. */
export const hrTimeOffBalanceListTemplate = listTemplateOf({
    name: 'HrTimeOffBalanceList', entity: HrEntityKind.Balance, displayName: 'HR time-off balances', description: 'Each employee\'s entitlement, days taken and days left, with how much of it is used.',
    title: 'Balances', subtitle: 'Time off taken and left this year', searchLabel: 'Search balances', urlKey: 'balances', primary: { label: 'Request time off', dialog: 'HrRequestTimeOff' },
    rowActions: ['View employee'], bulkActions: [], titleField: 'employee', readOnly: true,
});

/** The onboarding: new hires, when they start, who looks after them and how far along their checklist is. Choosing a row opens the checklist. */
export const hrOnboardingListTemplate = listTemplateOf({
    name: 'HrOnboardingList', entity: HrEntityKind.Onboarding, displayName: 'HR onboarding', description: 'New hires with their start date, owner and a progress bar of their checklist.',
    title: 'Onboarding', subtitle: 'New hires and how far along they are', searchLabel: 'Search new hires', urlKey: 'onboarding', primary: { label: 'New employee', dialog: 'HrQuickCreateEmployee' },
    rowActions: ['Open checklist', 'Remind owner'], bulkActions: [], titleField: 'name', recordScreen: 'hr.onboarding.record',
});
