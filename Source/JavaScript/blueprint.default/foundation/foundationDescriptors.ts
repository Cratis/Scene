// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, ComponentDescriptor, PropertyDescriptor, PropertyEditorKind, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey, valueOutputProperty } from '@cratis/scene.react';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintName } from '../packageName';
import { ActivityKind } from './activityModel';
import { ApprovalState } from './approvalModel';
import { CellKind, ListVariant } from './listModel';
import { FormFieldType, FormMode } from './formModel';
import { ChartKind } from './chartGeometry';
import { ComponentState } from './ComponentState';
import { FilterFieldType } from './filterModel';
import { NumberFormat } from './formatting';
import { PermissionRule } from './PermissionRule';
import { StatusTone } from './StatusChip';

/** Data properties take what a screen binds them to: a query's result, a data context or another component's output. */
export const bindable = [BindingSourceKind.DataContext, BindingSourceKind.QueryResult, BindingSourceKind.ComponentProperty];

const text = (path: string, label: string, group: string, description?: string, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.String, ...(group === 'Data' ? { acceptedBindingKinds: bindable } : {}), ...(description === undefined ? {} : { description }), ...extra });

const number = (path: string, label: string, group: string, description?: string, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.Number, editorKind: PropertyEditorKind.Number, ...(group === 'Data' ? { acceptedBindingKinds: bindable } : {}), ...(description === undefined ? {} : { description }), ...extra });

const flag = (path: string, label: string, group: string, description?: string, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.Boolean, editorKind: PropertyEditorKind.Boolean, ...(description === undefined ? {} : { description }), ...extra });

const choice = (path: string, label: string, group: string, values: Record<string, string>, defaultValue: string, description?: string): PropertyDescriptor =>
    ({
        path, label, group, valueType: PropertyValueType.Enum, editorKind: PropertyEditorKind.Enum, default: defaultValue,
        choices: Object.entries(values).map(([value, name]) => ({ value, label: name })), ...(description === undefined ? {} : { description }),
    });

export const list = (path: string, label: string, group: string, itemLabel: string, properties: PropertyDescriptor[], description?: string): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.Collection, default: [], item: { label: itemLabel, properties }, ...(description === undefined ? {} : { description }) });

const rule = (path: string, label: string, description: string): PropertyDescriptor =>
    choice(path, label, 'Permissions', { [PermissionRule.Enabled]: 'Enabled', [PermissionRule.Disabled]: 'Disabled', [PermissionRule.Hidden]: 'Hidden' }, PermissionRule.Enabled, description);

/** The properties every data-showing foundation component shares: the standard states (spec Part B 1.4) and the cross-cutting rules of 1.5. */
export const standardStateProperties: PropertyDescriptor[] = [
    choice('state', 'Preview state', 'State', {
        [ComponentState.Ready]: 'Ready', [ComponentState.Loading]: 'Loading', [ComponentState.Empty]: 'Empty',
        [ComponentState.Error]: 'Error', [ComponentState.NoPermission]: 'No permission', [ComponentState.Partial]: 'Partial',
    }, ComponentState.Ready, 'Forces a state so each can be designed and previewed; empty means the state follows the bound data.'),
    text('error', 'Error message', 'State', 'The message of the error state; setting it puts the component in that state.'),
    flag('loading', 'Loading', 'State', 'Shows the skeleton while the data has not answered.'),
    flag('forbidden', 'Not allowed', 'State', 'Shows the no-permission state, which explains what is missing and shows no data.'),
    text('permissionSubject', 'What access is missing', 'State', 'Names what the user cannot see in the no-permission message.'),
    { path: 'failedRegions', label: 'Failed regions', group: 'State', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [], description: 'The parts that failed to load; any entry puts the component in the partial state.' },
    text('emptyHeadline', 'Empty headline', 'State'),
    text('emptyHint', 'Empty hint', 'State'),
    text('emptyActionLabel', 'Empty action', 'State', 'The primary action offered when there is nothing to show.'),
    rule('actionPermission', 'Empty action permission', 'Whether the empty state offers its action, refuses it with a reason, or does not render it.'),
    text('label', 'Label', 'Accessibility', 'The accessible name of the region.'),
    text('locale', 'Locale', 'Content', 'The locale dates, numbers and currency are formatted in; empty follows the document.'),
    choice('density', 'Density', 'Appearance', { comfortable: 'Comfortable', compact: 'Compact' }, 'comfortable'),
    { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap, description: 'Replaces the text the component says itself, for localization.' },
];

const key = (name: ComponentName) => componentRegistryKey(defaultBlueprintName, name);

const formats = { [NumberFormat.Number]: 'Number', [NumberFormat.Currency]: 'Currency', [NumberFormat.Percent]: 'Percent', [NumberFormat.Compact]: 'Compact' };

/** What can be edited on the foundation components (Part B 4). Each declares the shape of its data, never values (SD1). */
export const foundationDescriptors: ComponentDescriptor[] = [
    {
        component: key(ComponentName.EmptyState),
        displayName: 'Empty state',
        description: 'An icon, a headline, a hint and one primary action; embeddable in any region.',
        properties: [
            text('headline', 'Headline', 'Content', undefined, { default: 'Nothing here yet' }),
            text('hint', 'Hint', 'Content'),
            text('icon', 'Icon', 'Appearance'),
            text('actionLabel', 'Primary action', 'Behavior', 'The label of the one action the state offers; its behaviors say what it does.'),
            rule('actionPermission', 'Action permission', 'Whether the action works, refuses with a reason, or is not rendered.'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.StatCard),
        displayName: 'Stat card',
        description: 'One key figure with its label, trend and the period the trend is compared to.',
        properties: [
            text('label', 'Label', 'Content', 'What the figure measures.', { constraints: { required: true } }),
            number('value', 'Value', 'Data', 'The figure; bind it to a query result.'),
            choice('format', 'Format', 'Appearance', formats, NumberFormat.Number),
            text('currency', 'Currency', 'Appearance', 'The ISO 4217 code when the format is currency.'),
            number('fractionDigits', 'Fraction digits', 'Appearance'),
            number('change', 'Change', 'Data', 'How much the figure moved, as a percentage; bind it to a query result.'),
            choice('goodDirection', 'Good direction', 'Appearance', { up: 'Up is good', down: 'Down is good' }, 'up', 'Which movement is good: a falling response time is.'),
            text('comparison', 'Compared to', 'Content', 'The period the change is compared to, for example "last month".'),
            ...standardStateProperties.filter(property => property.path !== 'label'),
        ],
    },
    {
        component: key(ComponentName.TrendChip),
        displayName: 'Trend chip',
        description: 'A change drawn as a direction, a magnitude and whether the movement is good.',
        properties: [
            number('change', 'Change', 'Data', 'The movement; bind it to a query result.'),
            choice('format', 'Format', 'Appearance', formats, NumberFormat.Percent),
            choice('goodDirection', 'Good direction', 'Appearance', { up: 'Up is good', down: 'Down is good' }, 'up'),
            text('comparison', 'Compared to', 'Content'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.StatusChip),
        displayName: 'Status chip',
        description: 'A status shown as a semantic color, an icon and its text; the text is always shown.',
        properties: [
            text('status', 'Status', 'Data', 'The status text; bind it to a query result.', { constraints: { required: true } }),
            choice('tone', 'Tone', 'Appearance', {
                [StatusTone.Success]: 'Success', [StatusTone.Warning]: 'Warning', [StatusTone.Danger]: 'Danger', [StatusTone.Info]: 'Info', [StatusTone.Neutral]: 'Neutral',
            }, StatusTone.Neutral, 'The tone picks the icon and the theme color.'),
        ],
    },
    {
        component: key(ComponentName.ChartWrapper),
        displayName: 'Chart',
        description: 'One chart - line, bar, stacked, donut or funnel - with a legend and a table of the same data. A donut and a funnel draw the first series.',
        properties: [
            text('title', 'Title', 'Content'),
            choice('kind', 'Chart type', 'Appearance', {
                [ChartKind.Line]: 'Line', [ChartKind.Bar]: 'Bar', [ChartKind.Stacked]: 'Stacked bar', [ChartKind.Donut]: 'Donut', [ChartKind.Funnel]: 'Funnel',
            }, ChartKind.Line),
            { path: 'categories', label: 'Categories', group: 'Data', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [], acceptedBindingKinds: bindable, description: 'The label of each point, bar or slice, in order.' },
            {
                ...list('series', 'Series', 'Data', 'Series', [
                    text('name', 'Name', 'Data', undefined, { constraints: { required: true } }),
                    { path: 'values', label: 'Values', group: 'Data', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.NumberList, default: [], description: 'One value for each category.' },
                ], 'What is plotted: a named list of values, one per category.'),
                acceptedBindingKinds: bindable,
            },
            choice('format', 'Value format', 'Appearance', formats, NumberFormat.Number),
            text('currency', 'Currency', 'Appearance', 'The ISO 4217 code when the format is currency.'),
            ...standardStateProperties.filter(property => property.path !== 'label'),
        ],
    },
    {
        component: key(ComponentName.FilterBuilder),
        displayName: 'Filter builder',
        description: 'Conditions on fields, joined by AND or OR in groups that nest three deep. The filter is published as the value output; the component filters nothing itself.',
        properties: [
            {
                ...list('fields', 'Fields', 'Data', 'Field', [
                    text('name', 'Name', 'Data', 'The result field the condition tests.', { constraints: { required: true }, editorKind: PropertyEditorKind.Field }),
                    text('label', 'Label', 'Content'),
                    choice('type', 'Type', 'Data', {
                        [FilterFieldType.Text]: 'Text', [FilterFieldType.Number]: 'Number', [FilterFieldType.Date]: 'Date', [FilterFieldType.Select]: 'Select', [FilterFieldType.Boolean]: 'Yes / no',
                    }, FilterFieldType.Text, 'Decides the operators offered.'),
                    { path: 'options', label: 'Options', group: 'Data', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [], description: 'The choices of a select field.' },
                ], 'What can be filtered.'),
                acceptedBindingKinds: bindable,
            },
            { path: 'filter', label: 'Initial filter', group: 'Data', valueType: PropertyValueType.Object, acceptedBindingKinds: bindable, description: 'A filter to start from, usually bound to the active saved view.' },
            rule('editPermission', 'Edit permission', 'Enabled lets the user change the filter; disabled shows it read-only.'),
            valueOutputProperty(PropertyValueType.Object, 'The filter as the user has built it: { operator, conditions, groups }, published as it changes.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.ColumnChooser),
        displayName: 'Column chooser',
        description: 'Which columns a table shows, and in what order. Publishes the ordered ids of the visible columns as the value output.',
        properties: [
            {
                ...list('columns', 'Columns', 'Data', 'Column', [
                    text('id', 'Id', 'Data', 'The result field the column shows.', { constraints: { required: true }, editorKind: PropertyEditorKind.Field }),
                    text('label', 'Label', 'Content'),
                    flag('visible', 'Visible', 'Content', 'Whether the column starts shown.', { default: true }),
                    flag('locked', 'Always shown', 'Content', 'A locked column cannot be hidden: the identifying column is.'),
                ], 'What could be shown.'),
                acceptedBindingKinds: bindable,
            },
            valueOutputProperty(PropertyValueType.Json, 'The ids of the visible columns, in order, published as the user changes them.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.SavedViewsMenu),
        displayName: 'Saved views menu',
        description: 'A list\'s saved views as a menu button, with the current view as its label. Publishes the chosen view id as the value output.',
        properties: [
            {
                ...list('views', 'Views', 'Data', 'View', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                    text('label', 'Label', 'Content'),
                    text('description', 'Description', 'Content'),
                ], 'The choices.'),
                acceptedBindingKinds: bindable,
            },
            text('activeView', 'Active view', 'Data', 'The id of the view in force; bind it to start from a view.'),
            rule('savePermission', 'Save permission', 'Whether "Save current view" works, refuses with a reason, or is not shown.'),
            rule('managePermission', 'Manage permission', 'Whether "Manage views" works, refuses with a reason, or is not shown.'),
            valueOutputProperty(PropertyValueType.String, 'The id of the chosen view, published as the user chooses.'),
            { path: 'action', label: 'Requested action', group: 'Outputs', valueType: PropertyValueType.String, readOnly: true, output: true, description: '"save" or "manage" when the user asks for it; the host acts on it.' },
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.ChecklistSection),
        displayName: 'Checklist',
        description: 'Sections of tasks with an owner and due date each and a progress bar per section. Publishes the ids of the done tasks as the value output.',
        properties: [
            {
                ...list('sections', 'Sections', 'Data', 'Section', [
                    text('title', 'Title', 'Content', undefined, { constraints: { required: true } }),
                    list('items', 'Tasks', 'Data', 'Task', [
                        text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                        text('label', 'Task', 'Content', undefined, { constraints: { required: true } }),
                        text('owner', 'Owner', 'Data'),
                        text('due', 'Due date', 'Data', 'An ISO 8601 date.'),
                        flag('done', 'Done', 'Data'),
                    ]),
                ], 'The groups of tasks.'),
                acceptedBindingKinds: bindable,
            },
            text('today', 'Today', 'Content', 'The date overdue is judged against; empty is the current date.'),
            rule('editPermission', 'Edit permission', 'Enabled lets the user tick tasks; otherwise they are shown read-only.'),
            valueOutputProperty(PropertyValueType.Json, 'The ids of the done tasks, published as the user ticks them.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.ActivityFeed),
        displayName: 'Activity feed',
        description: 'What happened to a record, grouped by day. Content is supplied by the application; this lays it out.',
        properties: [
            {
                ...list('entries', 'Entries', 'Data', 'Entry', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                    text('actor', 'Who', 'Data'),
                    text('action', 'What', 'Data'),
                    choice('kind', 'Kind', 'Data', {
                        [ActivityKind.Comment]: 'Comment', [ActivityKind.Change]: 'Change', [ActivityKind.Status]: 'Status', [ActivityKind.System]: 'System',
                    }, ActivityKind.System),
                    text('at', 'When', 'Data', 'An ISO 8601 date and time.', { constraints: { required: true } }),
                    text('body', 'Text', 'Data', 'A comment\'s text or the detail of a change.', { editorOptions: { multiline: true } }),
                ], 'What happened.'),
                acceptedBindingKinds: bindable,
            },
            choice('order', 'Order', 'Appearance', { descending: 'Newest first', ascending: 'Oldest first' }, 'descending'),
            text('timeZone', 'Time zone', 'Content', 'The IANA zone days are cut in; empty is the reader\'s.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.AvatarStack),
        displayName: 'Avatar stack',
        description: 'Overlapping avatars for the people on a record, with a "+N" chip for the rest.',
        properties: [
            {
                ...list('people', 'People', 'Data', 'Person', [
                    text('name', 'Name', 'Data', undefined, { constraints: { required: true } }),
                    text('imageUrl', 'Picture', 'Data', 'Without one the initials are shown.'),
                ], 'Who is shown.'),
                acceptedBindingKinds: bindable,
            },
            number('max', 'Shown at most', 'Appearance', 'How many avatars before the rest fold into "+N".', { default: 4, constraints: { minimum: 1, integer: true } }),
            choice('size', 'Size', 'Appearance', { small: 'Small', medium: 'Medium' }, 'medium'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.FileUploader),
        displayName: 'File uploader',
        description: 'A drop zone and a button to choose files, checked against type and size before anything is sent. Publishes the selection as the value output.',
        properties: [
            text('accept', 'Accepted types', 'Behavior', 'Extensions, MIME types and wildcards separated by commas, for example ".pdf, image/*".'),
            number('maxSizeMb', 'Largest file (MB)', 'Behavior', undefined, { constraints: { minimum: 0 } }),
            flag('multiple', 'Several files', 'Behavior', undefined, { default: true }),
            text('serverUrl', 'Upload address', 'Behavior', 'Handed to the host\'s upload handler.'),
            rule('actionPermission', 'Upload permission', 'Whether files can be chosen or dropped, refused with a reason, or the control is hidden.'),
            valueOutputProperty(PropertyValueType.Json, 'The files chosen - name, size, type and status - published as they change.'),
            ...standardStateProperties.filter(property => property.path !== 'actionPermission'),
        ],
    },
    {
        component: key(ComponentName.ApprovalChainStepper),
        displayName: 'Approval chain',
        description: 'The steps a request goes through, who decides each and where it stands. A rejection stops the chain; the first undecided step is the current one.',
        properties: [
            {
                ...list('steps', 'Steps', 'Data', 'Step', [
                    text('label', 'Step', 'Content', undefined, { constraints: { required: true } }),
                    text('approver', 'Approver', 'Data'),
                    choice('state', 'State', 'Data', {
                        [ApprovalState.Pending]: 'Pending', [ApprovalState.Current]: 'Awaiting decision', [ApprovalState.Approved]: 'Approved', [ApprovalState.Rejected]: 'Rejected', [ApprovalState.Skipped]: 'Skipped',
                    }, ApprovalState.Pending),
                    text('at', 'Decided at', 'Data', 'An ISO 8601 date and time.'),
                    text('comment', 'Comment', 'Data'),
                ], 'The approvers in order.'),
                acceptedBindingKinds: bindable,
            },
            choice('orientation', 'Orientation', 'Appearance', { horizontal: 'Horizontal', vertical: 'Vertical' }, 'horizontal', 'A phone always reads vertically.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.OrgTree),
        displayName: 'Org tree',
        description: 'An organization as an expandable tree built from rows of who reports to whom. Publishes the selected id as the value output.',
        properties: [
            {
                ...list('nodes', 'People', 'Data', 'Person', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true }, editorKind: PropertyEditorKind.Field }),
                    text('label', 'Name', 'Data', undefined, { editorKind: PropertyEditorKind.Field }),
                    text('title', 'Title', 'Data', undefined, { editorKind: PropertyEditorKind.Field }),
                    text('parentId', 'Reports to', 'Data', 'The id of the person above; empty for the top.', { editorKind: PropertyEditorKind.Field }),
                ], 'One row per person or unit.'),
                acceptedBindingKinds: bindable,
            },
            number('expandedDepth', 'Levels open at first', 'Appearance', undefined, { default: 2, constraints: { minimum: 1, integer: true } }),
            text('selected', 'Selected', 'Data', 'The id of the selected node; bind it to start from one.'),
            valueOutputProperty(PropertyValueType.String, 'The id of the selected node, published as the user selects.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.PermissionMatrix),
        displayName: 'Permission matrix',
        description: 'Roles across, permissions down, a checkbox where they meet. Publishes the grants as the value output.',
        properties: [
            {
                ...list('roles', 'Roles', 'Data', 'Role', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                    text('label', 'Name', 'Data'),
                ], 'The columns.'),
                acceptedBindingKinds: bindable,
            },
            {
                ...list('permissions', 'Permissions', 'Data', 'Permission', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                    text('label', 'Name', 'Data'),
                    text('group', 'Group', 'Data', 'A heading the permission is listed under.'),
                ], 'The rows.'),
                acceptedBindingKinds: bindable,
            },
            {
                ...list('grants', 'Grants', 'Data', 'Grant', [
                    text('role', 'Role', 'Data', 'The id of a role.', { constraints: { required: true } }),
                    text('permission', 'Permission', 'Data', 'The id of a permission.', { constraints: { required: true } }),
                ], 'What each role holds.'),
                acceptedBindingKinds: bindable,
            },
            rule('editPermission', 'Edit permission', 'Enabled lets the user change grants; otherwise the matrix is read-only.'),
            valueOutputProperty(PropertyValueType.Json, 'The grants as the user has changed them: rows of role and permission, published as they change.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.DataList),
        displayName: 'Data list',
        description: 'The records of a collection as a table, as cards or grouped with subtotals, with search, sort, paging and selection that live in the address. On a phone a table becomes cards.',
        properties: [
            { path: 'rows', label: 'Rows', group: 'Data', valueType: PropertyValueType.Json, acceptedBindingKinds: bindable, default: [], description: 'The records; bind to a query result.' },
            {
                ...list('columns', 'Columns', 'Data', 'Column', [
                    text('field', 'Field', 'Data', 'The result field the column shows.', { constraints: { required: true }, editorKind: PropertyEditorKind.Field }),
                    text('header', 'Header', 'Content'),
                    choice('kind', 'Kind', 'Appearance', { [CellKind.Text]: 'Text', [CellKind.Number]: 'Number', [CellKind.Currency]: 'Currency', [CellKind.Date]: 'Date', [CellKind.Status]: 'Status' }, CellKind.Text),
                    flag('sortable', 'Sortable', 'Behavior', undefined, { default: true }),
                    text('currency', 'Currency', 'Appearance'),
                    { path: 'tones', label: 'Status tones', group: 'Appearance', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap, description: 'The tone (success, warning, danger, info, neutral) of each status value.' },
                ], 'What is shown.'),
                acceptedBindingKinds: bindable,
            },
            choice('variant', 'Layout', 'Appearance', { [ListVariant.Table]: 'Table', [ListVariant.Cards]: 'Cards', [ListVariant.Grouped]: 'Grouped' }, ListVariant.Table),
            flag('collapse', 'Cards on a phone', 'Appearance', 'A table becomes cards on a phone-wide screen; nothing is hidden.', { default: true }),
            text('idField', 'Id field', 'Data', undefined, { default: 'id', editorKind: PropertyEditorKind.Field }),
            text('titleField', 'Title field', 'Data', 'The field that names a row for assistive technology and a card.', { editorKind: PropertyEditorKind.Field }),
            text('groupBy', 'Group by', 'Data', undefined, { editorKind: PropertyEditorKind.Field }),
            text('totalField', 'Subtotal field', 'Data', undefined, { editorKind: PropertyEditorKind.Field }),
            number('pageSize', 'Rows per page', 'Behavior', '0 shows every row.', { default: 0, constraints: { minimum: 0, integer: true } }),
            choice('selectionMode', 'Selection', 'Behavior', { none: 'None', single: 'One row', multiple: 'Many rows' }, 'none'),
            { path: 'rowActions', label: 'Row actions', group: 'Behavior', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [], description: 'The actions in each row\'s menu; each is the action output.' },
            rule('actionPermission', 'Row action permission', 'Whether row actions work, refuse with a reason or are not shown.'),
            text('search', 'Search', 'Data', 'The search text; bind to the search box output.', { acceptedBindingKinds: bindable }),
            { path: 'filter', label: 'Filter', group: 'Data', valueType: PropertyValueType.Object, acceptedBindingKinds: bindable, description: 'The filter builder\'s value.' },
            text('sort', 'Sort', 'Data', 'The sorted field; a leading - is descending.'),
            text('urlKey', 'Address prefix', 'Behavior', 'Keeps search, sort, page and selection in the address under this prefix.'),
            valueOutputProperty(PropertyValueType.Json, 'The selected row id (single) or ids (many).'),
            { path: 'action', label: 'Requested action', group: 'Outputs', valueType: PropertyValueType.Json, readOnly: true, output: true, description: 'The row action the user chose, with its row id.' },
            ...standardStateProperties.filter(property => property.path !== 'actionPermission'),
        ],
    },
    {
        component: key(ComponentName.TabSet),
        displayName: 'Tab set',
        description: 'Tabs with a panel for each: the content of tab `overview` is the slot `overview`. The active tab is kept in the address.',
        properties: [
            {
                ...list('tabs', 'Tabs', 'Data', 'Tab', [
                    text('id', 'Id', 'Data', 'Also the name of the slot that holds the tab\'s content.', { constraints: { required: true } }),
                    text('label', 'Label', 'Content'),
                    text('badge', 'Count', 'Content'),
                    flag('disabled', 'Disabled', 'Behavior'),
                ], 'The tabs a record page offers.'),
                acceptedBindingKinds: bindable,
            },
            text('activeTab', 'Active tab', 'Behavior'),
            text('urlKey', 'Address parameter', 'Behavior', 'Keeps the active tab in the address under this name.'),
            text('label', 'Label', 'Accessibility'),
            valueOutputProperty(PropertyValueType.String, 'The id of the active tab.'),
            ...standardStateProperties.filter(property => property.path !== 'label'),
        ],
    },
    {
        component: key(ComponentName.SubNavigation),
        displayName: 'Sub-navigation',
        description: 'A module\'s own sections as a tab bar or a left rail. Choosing one changes only the section.',
        properties: [
            {
                ...list('items', 'Sections', 'Data', 'Section', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                    text('label', 'Label', 'Content'),
                    text('badge', 'Count', 'Content'),
                    flag('disabled', 'Disabled', 'Behavior'),
                ], 'The sections.'),
                acceptedBindingKinds: bindable,
            },
            choice('orientation', 'Orientation', 'Appearance', { horizontal: 'Tabs', vertical: 'Left rail' }, 'horizontal'),
            text('activeItem', 'Active section', 'Behavior'),
            text('urlKey', 'Address parameter', 'Behavior'),
            text('label', 'Label', 'Accessibility'),
            valueOutputProperty(PropertyValueType.String, 'The id of the active section.'),
            ...standardStateProperties.filter(property => property.path !== 'label'),
        ],
    },
    {
        component: key(ComponentName.DialogFrame),
        displayName: 'Dialog frame',
        description: 'The head of a dialog: its title, a message and the consequences it states, and a close button. It makes the dialog it opens in keep focus inside, restore it, close on Escape and be drawn centered, as a side sheet or full height.',
        properties: [
            text('title', 'Title', 'Content', undefined, { constraints: { required: true } }),
            text('subtitle', 'Subtitle', 'Content'),
            text('message', 'Message', 'Content', 'What the dialog asks or says.'),
            { path: 'consequences', label: 'Consequences', group: 'Content', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [], description: 'What will happen if the person goes ahead, one line each.' },
            choice('placement', 'Placement', 'Appearance', { center: 'Centered', side: 'Side sheet', full: 'Full height' }, 'center', 'Where the dialog is drawn; on a phone every dialog fills the page.'),
            choice('tone', 'Tone', 'Appearance', { default: 'Default', danger: 'Destructive' }, 'default', 'A destructive dialog is drawn in the danger colors.'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.ActionButton),
        displayName: 'Action button',
        description: 'One action, drawn as every action of the foundation is, that is enabled, disabled with its reason, or hidden by the permission of the user.',
        properties: [
            text('label', 'Label', 'Content', 'What it does - a verb, never "OK".', { constraints: { required: true } }),
            choice('emphasis', 'Emphasis', 'Appearance', { primary: 'Primary', secondary: 'Secondary', quiet: 'Quiet', danger: 'Destructive' }, 'primary'),
            rule('permission', 'Permission', 'Whether the action works, refuses with a reason or is not shown.'),
            text('disabledReason', 'Reason when disabled', 'Permissions'),
            text('targetScreen', 'Go to screen', 'Behavior', 'The screen it goes to when no behavior is attached.'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.Notice),
        displayName: 'Notice',
        description: 'One message about the region it sits in, announced when it arrives. Empty until it has something to say.',
        properties: [
            text('text', 'Message', 'Data', 'Bind to the error or note to show; empty draws nothing.'),
            text('title', 'Title', 'Content'),
            choice('tone', 'Tone', 'Appearance', { danger: 'Error', warning: 'Warning', info: 'Information', success: 'Success', neutral: 'Neutral' }, 'danger'),
            text('locale', 'Locale', 'Content'),
        ],
    },
    {
        component: key(ComponentName.BulkBar),
        displayName: 'Bulk bar',
        description: 'Appears when records are selected, says how many, offers the bulk actions and clears the selection.',
        properties: [
            { path: 'selection', label: 'Selection', group: 'Data', valueType: PropertyValueType.Json, acceptedBindingKinds: bindable, description: 'The selected records or their count; bind to the list\'s value.' },
            { path: 'actions', label: 'Actions', group: 'Behavior', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [] },
            rule('actionPermission', 'Action permission', 'Whether the bulk actions work, refuse with a reason or are not shown.'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.GlobalSearch),
        displayName: 'Search',
        description: 'A search box for the topbar or a list\'s toolbar. The text is the value output and can live in the address.',
        properties: [
            text('text', 'Initial text', 'Data'),
            text('placeholder', 'Placeholder', 'Content'),
            text('label', 'Label', 'Accessibility'),
            text('urlKey', 'Address parameter', 'Behavior'),
            valueOutputProperty(PropertyValueType.String, 'The search text.'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.NotificationsButton),
        displayName: 'Notifications button',
        description: 'The bell of the topbar with the unread count, said in words as well as in the badge.',
        properties: [
            number('count', 'Unread', 'Data', 'Bind to a query result.', { constraints: { minimum: 0, integer: true } }),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.KanbanBoard),
        displayName: 'Kanban board',
        description: 'Columns mapped to a status, with cards that move by dragging or by their own Move-to menu. The new arrangement is the value output.',
        properties: [
            {
                ...list('columns', 'Columns', 'Data', 'Column', [
                    text('id', 'Id', 'Data', 'The status or stage value.', { constraints: { required: true } }),
                    text('label', 'Label', 'Content'),
                    number('limit', 'Limit', 'Behavior', 'The most cards the stage should hold; 0 is no limit.', { constraints: { minimum: 0, integer: true } }),
                ], 'The stages.'),
                acceptedBindingKinds: bindable,
            },
            {
                ...list('cards', 'Cards', 'Data', 'Card', [
                    text('id', 'Id', 'Data', undefined, { constraints: { required: true } }),
                    text('title', 'Title', 'Data', undefined, { constraints: { required: true } }),
                    text('column', 'Column', 'Data', 'The id of the column the card is in.'),
                    text('assignee', 'Assignee', 'Data'),
                    number('amount', 'Amount', 'Data', 'A numeric field a column can total - a deal\'s value; any numeric field of a card can be named by the board\'s total field.'),
                    { path: 'badges', label: 'Badges', group: 'Data', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [] },
                ], 'The cards, from a query.'),
                acceptedBindingKinds: bindable,
            },
            text('totalField', 'Total field', 'Data', 'The numeric card field each column header totals (a deal\'s amount); empty shows no totals.', { editorKind: PropertyEditorKind.Field }),
            choice('format', 'Total format', 'Appearance', { number: 'Number', currency: 'Currency', percent: 'Percent', compact: 'Compact' }, 'number'),
            text('currency', 'Currency', 'Appearance', 'The ISO 4217 code of a currency total.'),
            rule('editPermission', 'Move permission', 'Enabled lets cards move; otherwise the board is read-only.'),
            valueOutputProperty(PropertyValueType.Json, 'Each card\'s id and column, published as cards move.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.WizardProgress),
        displayName: 'Wizard',
        description: 'A linear wizard: the steps, back/next/finish and the draft save. The content of step `details` is the slot `details`; the last step is the review.',
        properties: [
            {
                ...list('steps', 'Steps', 'Data', 'Step', [
                    text('id', 'Id', 'Data', 'Also the name of the slot that holds the step\'s content.', { constraints: { required: true } }),
                    text('label', 'Label', 'Content'),
                    flag('valid', 'Valid', 'Data', 'Whether the step\'s fields are valid; an invalid step blocks Next.', { default: true, acceptedBindingKinds: bindable }),
                ], 'The steps in order.'),
                acceptedBindingKinds: bindable,
            },
            text('currentStep', 'Current step', 'Behavior'),
            text('urlKey', 'Address parameter', 'Behavior', 'Keeps the current step in the address so a refresh resumes.'),
            valueOutputProperty(PropertyValueType.String, 'The id of the current step.'),
            ...standardStateProperties,
        ],
    },
    {
        component: key(ComponentName.FormScreenBody),
        displayName: 'Form',
        description: 'Titled sections of fields in a one-to-three column grid, with inline validation, a save bar, the unsaved-changes guard and four modes.',
        properties: [
            flag('saveAndNew', 'Offer Save and new', 'Behavior', 'Whether a create form offers Save and new next to Save; a dialog that creates one record leaves it out.', { default: true }),
            {
                ...list('sections', 'Sections', 'Data', 'Section', [
                    text('id', 'Id', 'Data'),
                    text('title', 'Title', 'Content'),
                    number('columns', 'Columns', 'Appearance', undefined, { default: 1, constraints: { minimum: 1, maximum: 3, integer: true } }),
                    list('fields', 'Fields', 'Data', 'Field', [
                        text('name', 'Name', 'Data', undefined, { constraints: { required: true }, editorKind: PropertyEditorKind.Field }),
                        text('label', 'Label', 'Content'),
                        choice('type', 'Type', 'Data', Object.fromEntries(Object.values(FormFieldType).map(type => [type, type])), FormFieldType.Text),
                        flag('required', 'Required', 'Data'),
                        { path: 'options', label: 'Options', group: 'Data', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [] },
                        number('span', 'Columns spanned', 'Appearance', undefined, { default: 1, constraints: { minimum: 1, maximum: 3, integer: true } }),
                        text('placeholder', 'Placeholder', 'Content'),
                        text('help', 'Help text', 'Content'),
                    ]),
                ], 'The groups of fields.'),
                acceptedBindingKinds: bindable,
            },
            { path: 'values', label: 'Values', group: 'Data', valueType: PropertyValueType.Object, acceptedBindingKinds: bindable, description: 'The record being edited; empty when creating.' },
            { path: 'errors', label: 'Server errors', group: 'Data', valueType: PropertyValueType.Json, acceptedBindingKinds: bindable, description: 'Field errors from the server, as { field: message }; one for an unknown field is shown as a general error.' },
            choice('mode', 'Mode', 'Behavior', { [FormMode.Create]: 'Create', [FormMode.Edit]: 'Edit', [FormMode.ReadOnly]: 'Read-only', [FormMode.Settings]: 'Settings (a save for each section)' }, FormMode.Create),
            rule('editPermission', 'Edit permission', 'Enabled lets the user change fields; otherwise the form is read-only.'),
            rule('savePermission', 'Save permission', 'Whether Save works, refuses with a reason or is not shown.'),
            valueOutputProperty(PropertyValueType.Object, 'The values as the user has edited them.'),
            ...standardStateProperties,
        ],
    },
];

