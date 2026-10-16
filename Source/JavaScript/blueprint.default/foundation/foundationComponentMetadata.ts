// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory } from '@cratis/scene.model';
import { ComponentMetadata, componentMetadata as m } from '@cratis/scene.react';
import { ComponentName } from '../ComponentName';

/**
 * The category, icon, keywords and picker badge of every foundation component (CMP1), keyed by bare component name.
 * The names are those of `ComponentName`; the metadata of the rest of the package lives in `defaultBlueprintComponentMetadata`.
 */
export const foundationComponentMetadata: Record<string, ComponentMetadata> = {
    [ComponentName.EmptyState]: m('Empty state', ComponentCategory.Feedback, 'inbox', ['no data', 'nothing', 'blank slate', 'zero state']),
    [ComponentName.StatCard]: m('Stat card', ComponentCategory.DataDisplay, 'gauge', ['kpi', 'metric', 'figure', 'number', 'dashboard']),
    [ComponentName.TrendChip]: m('Trend chip', ComponentCategory.DataDisplay, 'trending-up', ['delta', 'change', 'arrow', 'comparison']),
    [ComponentName.StatusChip]: m('Status chip', ComponentCategory.DataDisplay, 'badge-check', ['badge', 'state', 'tag', 'label']),
    [ComponentName.ChartWrapper]: m('Chart', ComponentCategory.DataDisplay, 'chart-line', ['graph', 'line', 'bar', 'stacked', 'donut', 'pie', 'funnel', 'plot']),
    [ComponentName.FilterBuilder]: m('Filter builder', ComponentCategory.Input, 'list-filter', ['filter', 'query', 'conditions', 'and or', 'search']),
    [ComponentName.ColumnChooser]: m('Column chooser', ComponentCategory.Actions, 'columns-3', ['columns', 'fields', 'show hide', 'table']),
    [ComponentName.SavedViewsMenu]: m('Saved views menu', ComponentCategory.Actions, 'bookmark', ['views', 'presets', 'saved filters']),
    [ComponentName.ChecklistSection]: m('Checklist', ComponentCategory.DataDisplay, 'list-checks', ['tasks', 'todo', 'onboarding', 'progress', 'steps']),
    [ComponentName.ActivityFeed]: m('Activity feed', ComponentCategory.DataDisplay, 'activity', ['timeline', 'history', 'comments', 'audit', 'log']),
    [ComponentName.AvatarStack]: m('Avatar stack', ComponentCategory.DataDisplay, 'users', ['people', 'members', 'assignees', 'team']),
    [ComponentName.FileUploader]: m('File uploader', ComponentCategory.Input, 'upload', ['attachments', 'files', 'drop zone', 'documents']),
    [ComponentName.ApprovalChainStepper]: m('Approval chain', ComponentCategory.Navigation, 'workflow', ['approvals', 'steps', 'workflow', 'sign off', 'stepper']),
    [ComponentName.OrgTree]: m('Org tree', ComponentCategory.DataDisplay, 'network', ['organization', 'hierarchy', 'org chart', 'reports to', 'tree']),
    [ComponentName.PermissionMatrix]: m('Permission matrix', ComponentCategory.Input, 'shield-check', ['roles', 'permissions', 'access', 'grants', 'rbac']),
    [ComponentName.DataList]: m('Data list', ComponentCategory.DataDisplay, 'table', ['table', 'grid', 'records', 'cards', 'collection', 'list']),
    [ComponentName.TabSet]: m('Tab set', ComponentCategory.Navigation, 'panel-top', ['tabs', 'sections', 'panels']),
    [ComponentName.SubNavigation]: m('Sub-navigation', ComponentCategory.Navigation, 'panel-left', ['module', 'sections', 'rail', 'tabs']),
    [ComponentName.DialogFrame]: m('Dialog frame', ComponentCategory.Feedback, 'panel-top', ['dialog', 'modal', 'sheet', 'drawer', 'confirm', 'header']),
    [ComponentName.ActionButton]: m('Action button', ComponentCategory.Actions, 'mouse-pointer-click', ['button', 'action', 'submit', 'cancel', 'confirm']),
    [ComponentName.Notice]: m('Notice', ComponentCategory.Feedback, 'circle-alert', ['message', 'error', 'alert', 'banner', 'warning']),
    [ComponentName.BulkBar]: m('Bulk bar', ComponentCategory.Actions, 'check-check', ['selection', 'bulk', 'batch', 'actions']),
    [ComponentName.GlobalSearch]: m('Search', ComponentCategory.Input, 'search', ['search', 'find', 'query']),
    [ComponentName.NotificationsButton]: m('Notifications button', ComponentCategory.Actions, 'bell', ['bell', 'alerts', 'unread']),
    [ComponentName.KanbanBoard]: m('Kanban board', ComponentCategory.DataDisplay, 'kanban', ['board', 'kanban', 'columns', 'pipeline', 'cards']),
    [ComponentName.WizardProgress]: m('Wizard', ComponentCategory.Navigation, 'footprints', ['wizard', 'steps', 'stepper', 'multi-step']),
    [ComponentName.FormScreenBody]: m('Form', ComponentCategory.Forms, 'text-cursor-input', ['form', 'fields', 'sections', 'validation']),
    [ComponentName.InboxList]: m('Inbox', ComponentCategory.DataDisplay, 'inbox', ['inbox', 'queue', 'messages', 'notifications', 'requests', 'unread']),
    [ComponentName.TimelineGrid]: m('Timeline', ComponentCategory.DataDisplay, 'gantt-chart', ['timeline', 'gantt', 'schedule', 'roadmap', 'dependencies', 'milestones']),
    [ComponentName.CalendarGrid]: m('Calendar', ComponentCategory.DataDisplay, 'calendar-days', ['calendar', 'month', 'week', 'agenda', 'events', 'schedule', 'time off']),
};
