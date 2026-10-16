// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintName } from '../packageName';
import { ComponentState } from './ComponentState';

/**
 * What a story or a specification feeds each foundation component to see it populated.
 *
 * These are design-time and test-time values, never part of what a component is: a component declares the shape of its data
 * and a screen binds it to a query (spec SD1). The domain blueprints supply real preview data as sample-data packs; this is
 * only enough to draw each component in each state.
 */
export interface FoundationSample {
    /** The properties that make the component populated. */
    properties: Record<string, unknown>;

    /** Text that only appears when the component shows its data, so a specification can prove the no-permission state shows none of it. */
    data: string[];

    /** Whether the component shows data and so owns the five standard states; chips and the empty state themselves do not. */
    stateful: boolean;
}

export const foundationSamples: Record<string, FoundationSample> = {
    [ComponentName.EmptyState]: { properties: { headline: 'No invoices yet', hint: 'Invoices you create appear here.', icon: 'file', actionLabel: 'New invoice' }, data: [], stateful: false },
    [ComponentName.StatCard]: { properties: { label: 'Open pipeline', value: 1234567, format: 'currency', currency: 'USD', change: 12.5, comparison: 'last month', locale: 'en-US' }, data: ['$1,234,567'], stateful: true },
    [ComponentName.TrendChip]: { properties: { change: -3.2, goodDirection: 'down', comparison: 'last week', locale: 'en-US' }, data: [], stateful: false },
    [ComponentName.StatusChip]: { properties: { status: 'Awaiting approval', tone: 'warning' }, data: [], stateful: false },
    [ComponentName.ChartWrapper]: {
        properties: { title: 'Revenue by quarter', kind: 'line', categories: ['Q1', 'Q2', 'Q3', 'Q4'], series: [{ name: 'Revenue', values: [120, 180, 150, 240] }, { name: 'Target', values: [100, 150, 200, 220] }], locale: 'en-US' },
        data: ['Revenue by quarter'], stateful: true,
    },
    [ComponentName.FilterBuilder]: {
        properties: {
            fields: [{ name: 'owner', label: 'Owner', type: 'text' }, { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Won', 'Lost'] }, { name: 'value', label: 'Value', type: 'number' }],
            filter: { operator: 'and', conditions: [{ field: 'status', operator: 'is', value: 'Open' }, { field: 'owner', operator: 'contains', value: 'Ada' }], groups: [] },
        },
        data: ['2 active filters'], stateful: true,
    },
    [ComponentName.ColumnChooser]: {
        properties: { columns: [{ id: 'name', label: 'Name', locked: true }, { id: 'owner', label: 'Owner' }, { id: 'status', label: 'Status', visible: false }] },
        data: ['3 shown'], stateful: true,
    },
    [ComponentName.SavedViewsMenu]: {
        properties: { views: [{ id: 'all', label: 'All leads' }, { id: 'mine', label: 'Mine' }, { id: 'overdue', label: 'Overdue' }], activeView: 'mine' },
        data: ['Mine'], stateful: true,
    },
    [ComponentName.ChecklistSection]: {
        properties: {
            today: '2026-03-10', locale: 'en-US',
            sections: [
                { title: 'Before day one', items: [{ id: 't1', label: 'Send the contract', owner: 'Grace', due: '2026-03-01', done: true }, { id: 't2', label: 'Order a laptop', owner: 'Linus', due: '2026-03-05' }] },
                { title: 'First week', items: [{ id: 't3', label: 'Security training', owner: 'Ada', due: '2026-03-20' }] },
            ],
        },
        data: ['Send the contract', '1 of 2 complete'], stateful: true,
    },
    [ComponentName.ActivityFeed]: {
        properties: {
            locale: 'en-US', timeZone: 'UTC',
            entries: [
                { id: 'a1', actor: 'Ada Lovelace', action: 'commented', kind: 'comment', at: '2026-03-10T09:30:00Z', body: 'Sent the revised quote.' },
                { id: 'a2', actor: 'Grace Hopper', action: 'changed the owner to Linus', kind: 'change', at: '2026-03-09T16:00:00Z' },
                { id: 'a3', actor: 'System', action: 'marked the deal as qualified', kind: 'status', at: '2026-03-09T08:00:00Z' },
            ],
        },
        data: ['Sent the revised quote.'], stateful: true,
    },
    [ComponentName.AvatarStack]: {
        properties: { people: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Linus Torvalds' }, { name: 'Margaret Hamilton' }, { name: 'Alan Turing' }, { name: 'Barbara Liskov' }], max: 4 },
        data: ['+2'], stateful: true,
    },
    [ComponentName.FileUploader]: {
        properties: { accept: '.pdf, image/*', maxSizeMb: 10, multiple: true },
        data: [], stateful: true,
    },
    [ComponentName.ApprovalChainStepper]: {
        properties: {
            locale: 'en-US',
            steps: [
                { label: 'Team lead', approver: 'Grace Hopper', state: 'approved', at: '2026-03-09T10:00:00Z', comment: 'Looks fine.' },
                { label: 'Finance', approver: 'Linus Torvalds', state: 'current' },
                { label: 'Director', approver: 'Ada Lovelace', state: 'pending' },
            ],
        },
        data: ['Grace Hopper', 'Looks fine.'], stateful: true,
    },
    [ComponentName.OrgTree]: {
        properties: {
            nodes: [
                { id: 'ceo', label: 'Ada Lovelace', title: 'Chief executive' },
                { id: 'cto', label: 'Grace Hopper', title: 'Chief technology officer', parentId: 'ceo' },
                { id: 'cfo', label: 'Linus Torvalds', title: 'Chief financial officer', parentId: 'ceo' },
                { id: 'dev', label: 'Margaret Hamilton', title: 'Engineering manager', parentId: 'cto' },
            ],
        },
        data: ['Chief technology officer'], stateful: true,
    },
    [ComponentName.PermissionMatrix]: {
        properties: {
            roles: [{ id: 'admin', label: 'Administrator' }, { id: 'sales', label: 'Sales' }],
            permissions: [{ id: 'view', label: 'View deals', group: 'Deals' }, { id: 'edit', label: 'Edit deals', group: 'Deals' }, { id: 'users', label: 'Manage users', group: 'Administration' }],
            grants: [{ role: 'admin', permission: 'view' }, { role: 'admin', permission: 'edit' }, { role: 'admin', permission: 'users' }, { role: 'sales', permission: 'view' }],
        },
        data: ['Edit deals', 'Manage users'], stateful: true,
    },
    [ComponentName.DataList]: {
        properties: {
            locale: 'en-US', idField: 'id', titleField: 'name', selectionMode: 'multiple', pageSize: 5, rowActions: ['Open', 'Archive'],
            columns: [
                { field: 'name', header: 'Account' }, { field: 'owner', header: 'Owner' }, { field: 'value', header: 'Value', kind: 'currency', currency: 'USD' },
                { field: 'status', header: 'Status', kind: 'status', tones: { Open: 'info', Won: 'success', Lost: 'danger' } }, { field: 'closes', header: 'Closes', kind: 'date' },
            ],
            rows: [
                { id: '1', name: 'Northgate Ltd', owner: 'Ada', value: 12000, status: 'Open', closes: '2026-04-01' },
                { id: '2', name: 'Harbour & Sons', owner: 'Grace', value: 8400.5, status: 'Won', closes: '2026-03-12' },
                { id: '3', name: 'Fjord Supply', owner: 'Linus', value: 560, status: 'Lost', closes: '2026-02-20' },
            ],
        },
        data: ['Northgate Ltd', '3 items'], stateful: true,
    },
    [ComponentName.TabSet]: {
        properties: { tabs: [{ id: 'overview', label: 'Overview' }, { id: 'related', label: 'Related', badge: '4' }, { id: 'files', label: 'Files' }, { id: 'history', label: 'History', disabled: true }] },
        data: ['Overview', 'Related'], stateful: true,
    },
    [ComponentName.SubNavigation]: {
        properties: { items: [{ id: 'accounts', label: 'Accounts' }, { id: 'contacts', label: 'Contacts', badge: '12' }, { id: 'deals', label: 'Deals' }] },
        data: ['Accounts', 'Contacts'], stateful: true,
    },
    [ComponentName.DialogFrame]: { properties: { title: 'Archive product', message: 'Bamboo Watch will stop appearing in the catalog.', consequences: ['Existing orders keep it', 'It can be restored from the archive'], tone: 'danger' }, data: [], stateful: false },
    [ComponentName.ActionButton]: { properties: { label: 'Archive product', emphasis: 'danger' }, data: [], stateful: false },
    [ComponentName.Notice]: { properties: { text: 'The email or password is not right.', tone: 'danger' }, data: [], stateful: false },
    [ComponentName.BulkBar]: { properties: { selection: ['1', '2'], actions: ['Assign', 'Archive'] }, data: [], stateful: false },
    [ComponentName.GlobalSearch]: { properties: { placeholder: 'Search accounts', label: 'Search accounts' }, data: [], stateful: false },
    [ComponentName.NotificationsButton]: { properties: { count: 3 }, data: [], stateful: false },
    [ComponentName.KanbanBoard]: {
        properties: {
            columns: [{ id: 'new', label: 'New', limit: 2 }, { id: 'qualified', label: 'Qualified' }, { id: 'won', label: 'Won' }],
            cards: [
                { id: 'c1', title: 'Acme renewal', column: 'new', assignee: 'Ada', fields: [{ label: 'Value', value: '$12,000' }], badges: ['Hot'] },
                { id: 'c2', title: 'Globex rollout', column: 'new', assignee: 'Grace' },
                { id: 'c3', title: 'Initech pilot', column: 'new' },
                { id: 'c4', title: 'Umbrella upgrade', column: 'qualified' },
            ],
        },
        data: ['Acme renewal'], stateful: true,
    },
    [ComponentName.WizardProgress]: {
        properties: { steps: [{ id: 'details', label: 'Details' }, { id: 'people', label: 'People' }, { id: 'review', label: 'Review' }] },
        data: ['Details', 'People'], stateful: true,
    },
    [ComponentName.FormScreenBody]: {
        properties: {
            mode: 'create', locale: 'en-US',
            sections: [
                { title: 'Account details', columns: 2, fields: [
                    { name: 'name', label: 'Name', required: true }, { name: 'industry', label: 'Industry', type: 'select', options: ['Software', 'Retail'] },
                    { name: 'revenue', label: 'Revenue', type: 'currency' }, { name: 'since', label: 'Customer since', type: 'date' },
                    { name: 'notes', label: 'Notes', type: 'richText', span: 2 },
                ] },
                { title: 'Preferences', fields: [{ name: 'tags', label: 'Tags', type: 'multiSelect', options: ['VIP', 'Partner'] }, { name: 'active', label: 'Active', type: 'toggle' }] },
            ],
        },
        data: ['Account details'], stateful: true,
    },
    [ComponentName.CalendarGrid]: {
        properties: {
            today: '2026-03-10', date: '2026-03-10', locale: 'en-GB',
            events: [
                { id: 'e1', title: 'Ada Lovelace', start: '2026-03-09', end: '2026-03-13', category: 'Annual leave', tone: 'success', person: 'Ada Lovelace' },
                { id: 'e2', title: 'Grace Hopper', start: '2026-03-10', end: '2026-03-10', category: 'Sick leave', tone: 'warning', person: 'Grace Hopper' },
                { id: 'e3', title: 'Linus Torvalds', start: '2026-03-12', end: '2026-03-20', category: 'Parental leave', tone: 'info', person: 'Linus Torvalds' },
                { id: 'e4', title: 'Margaret Hamilton', start: '2026-03-10', end: '2026-03-11', category: 'Training', tone: 'neutral', person: 'Margaret Hamilton' },
            ],
        },
        data: ['March 2026', 'Ada Lovelace'], stateful: true,
    },
    [ComponentName.InboxList]: {
        properties: {
            today: '2026-03-10', locale: 'en-GB',
            messages: [
                { id: 'm1', title: 'Leave request: Ada Lovelace', summary: 'Five days from 16 March', sender: 'Ada Lovelace', received: '2026-03-10T08:30:00Z', category: 'Approval', tone: 'warning', unread: true },
                { id: 'm2', title: 'Expense report approved', summary: 'EUR 420 for the Oslo trip', sender: 'Finance', received: '2026-03-09T15:00:00Z', category: 'Notification', tone: 'success', unread: false },
                { id: 'm3', title: 'You were mentioned in Launch plan', summary: '"Can you confirm the date?"', sender: 'Grace Hopper', received: '2026-03-02T10:00:00Z', category: 'Mention', tone: 'info', unread: true },
            ],
        },
        data: ['Leave request: Ada Lovelace', 'Expense report approved'], stateful: true,
    },
    [ComponentName.TimelineGrid]: {
        properties: {
            today: '2026-03-10', scale: 'week', locale: 'en-GB',
            items: [
                { id: 't1', title: 'Design', start: '2026-03-02', end: '2026-03-13', lane: 'Ada Lovelace', progress: 100, tone: 'success' },
                { id: 't2', title: 'Build', start: '2026-03-16', end: '2026-04-10', lane: 'Grace Hopper', progress: 20, tone: 'info', dependsOn: ['t1'] },
                { id: 't3', title: 'Test', start: '2026-04-06', end: '2026-04-17', lane: 'Linus Torvalds', progress: 0, tone: 'warning', dependsOn: ['t2'] },
                { id: 't4', title: 'Launch', start: '2026-04-20', milestone: true, lane: 'Linus Torvalds', dependsOn: ['t3'] },
            ],
        },
        data: ['Design', 'Build'], stateful: true,
    },
};

/** A scene element for a foundation component, populated with its sample unless properties are given, with the state forced when asked. */
export function foundationElement(name: string, properties?: Record<string, unknown>, state?: ComponentState): ExternalComponent {
    const sample = foundationSamples[name];
    return {
        id: `${name}-sample`,
        componentName: componentRegistryKey(defaultBlueprintName, name),
        properties: { ...(properties ?? sample?.properties ?? {}), ...(state === undefined ? {} : { state }) },
        slots: {},
    } as unknown as ExternalComponent;
}
