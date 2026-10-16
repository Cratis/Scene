// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { listScreenTemplate } from '@cratis/scene.blueprint.default';
import { AdministrationEntityKind, fromQuery, administrationQueriesOf, localeOfData } from '../administrationQueries';
import { actionButton, component, goesTo, administrationMetadata, opensDialog, opensRecordOnSelect, withBehaviors } from '../administrationParts';

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
    entity: AdministrationEntityKind;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    urlKey: string;
    /** The primary action of the header: a quick-create dialog to open, or a screen to go to; absent for a list that is only read and exported. */
    primary?: { label: string; dialog?: string; screen?: string };
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
 * One Administration list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled for an entity. The slots, arrangement and
 * every behavior - sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const queries = administrationQueriesOf(options.entity);
    const id = options.name;
    const listId = `${id}-records`;
    const primary = options.primary && withBehaviors(actionButton(`${id}-primary`, options.primary.label, 'primary'), options.primary.dialog ? opensDialog(options.primary.dialog) : goesTo(options.primary.screen!));
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
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, { actions: primary ? [exportAction(`${id}-export`), primary] : [exportAction(`${id}-export`)] })],
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
        metadata: administrationMetadata(options.name, 'List', listScopes),
    };
}

/** The users: everyone with an account, with their role, status and when they were last active. Choosing a row opens the user; **Invite** opens the invitation dialog. */
export const administrationUserListTemplate = listTemplateOf({
    name: 'AdministrationUserList', entity: AdministrationEntityKind.User, displayName: 'Administration users', description: 'Users with name, email, role, status and last active, filtered by role, status and last active; an invite action.',
    title: 'Users', subtitle: 'Everyone with an account', searchLabel: 'Search users', urlKey: 'users', primary: { label: 'Invite user', dialog: 'AdministrationInviteUser' },
    rowActions: ['Edit', 'Suspend', 'Reset password'], bulkActions: [], titleField: 'name', recordScreen: 'admin.users.record',
});

/** The audit log: who did what to what and when, newest first. Read only - nobody edits history - and exportable. */
export const administrationAuditLogTemplate = listTemplateOf({
    name: 'AdministrationAuditLog', entity: AdministrationEntityKind.Audit, displayName: 'Administration audit log', description: 'Time, actor, action and target of every change, filtered by actor, action and date range; exportable.',
    title: 'Audit log', subtitle: 'Who did what, and when', searchLabel: 'Search the audit log', urlKey: 'audit', rowActions: [], bulkActions: [], titleField: 'actor', readOnly: true,
});
