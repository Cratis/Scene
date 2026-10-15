// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

/**
 * Every piece of text the foundation components say themselves, as opposed to text a screen author or a bound query
 * supplies. Nothing is hard-coded in a component (spec Part B 1.5): a component reads its text from here, merged with
 * the `strings` property of the element, so an application localizes by supplying a table - and a bound string
 * (a `{name}` placeholder is replaced by the values the component passes) arrives the same way any other property does.
 */
export const foundationStrings = {
    loading: 'Loading',
    emptyHeadline: 'Nothing here yet',
    emptyHint: 'There is nothing to show for now.',
    errorHeadline: 'This could not be loaded',
    errorHint: 'Something went wrong while loading. Try again in a moment.',
    retry: 'Try again',
    noPermissionHeadline: 'You do not have access',
    noPermissionHint: 'Ask an administrator to grant you access to {subject}.',
    noPermissionSubject: 'this content',
    partialHeadline: 'Some parts could not be loaded',
    partialHint: 'The unavailable parts are: {regions}.',
    disabledNoPermission: 'You do not have permission to do this',
    trendUp: 'up {value}',
    trendDown: 'down {value}',
    trendFlat: 'unchanged',
    trendComparison: 'compared to {period}',
    statusSuccess: 'Success',
    statusWarning: 'Warning',
    statusDanger: 'Problem',
    statusInfo: 'Information',
    statusNeutral: 'Status',
    chartNoData: 'No data to chart',
    chartDataTable: 'Chart data',
    chartSeries: 'Series',
    chartCategory: 'Category',
    filterAdd: 'Add condition',
    filterAddGroup: 'Add group',
    filterRemove: 'Remove condition',
    filterRemoveGroup: 'Remove group',
    filterMatchAll: 'Match all (AND)',
    filterMatchAny: 'Match any (OR)',
    filterField: 'Field',
    filterOperator: 'Operator',
    filterValue: 'Value',
    filterClear: 'Clear filters',
    filterCondition: 'Condition {n}',
    filterGroup: 'Group {n}',
    filterNoFields: 'There are no fields to filter on',
    opContains: 'contains',
    opEquals: 'equals',
    opNotEquals: 'does not equal',
    opStartsWith: 'starts with',
    opIsEmpty: 'is empty',
    opGreater: 'is greater than',
    opGreaterOrEqual: 'is at least',
    opLess: 'is less than',
    opLessOrEqual: 'is at most',
    opBefore: 'is before',
    opAfter: 'is after',
    opOn: 'is on',
    opIs: 'is',
    opIsNot: 'is not',
    opTrue: 'is yes',
    opFalse: 'is no',
    filterSummary: '{count} active filters',
    filterSummaryOne: '1 active filter',
    columnsChoose: 'Columns',
    columnsLocked: 'always shown',
    columnsReset: 'Show all columns',
    columnsMoveUp: 'Move {name} up',
    columnsMoveDown: 'Move {name} down',
    columnsShown: '{shown} of {total} shown',
    columnsNone: 'There are no columns to choose from',
    viewsLabel: 'Saved views',
    viewsDefault: 'All items',
    viewsSave: 'Save current view',
    viewsManage: 'Manage views',
    viewsNone: 'There are no saved views',
    checklistProgress: '{done} of {total} complete',
    checklistOwner: 'Owner',
    checklistOverdue: 'Overdue',
    checklistDone: 'Done',
    checklistOpen: 'Open',
    checklistItemProgress: 'Progress of {title}',
    checklistNone: 'This checklist has no tasks',
    checklistDue: 'Due',
    activityEmpty: 'No activity yet',
    activityComment: 'Comment',
    activityChange: 'Change',
    activityStatus: 'Status',
    activitySystem: 'System',
    activityBy: 'by {actor}',
    avatarOverflow: '{count} more',
    avatarPeople: '{count} people',
    uploadDrop: 'Drop files here or',
    uploadLimits: 'Up to {limit} each',
    uploadAccepts: 'Accepts {types}',
    uploadSelected: 'Selected files',
    uploadQueued: 'Ready to upload',
    uploadSingle: 'Only one file can be uploaded at a time',
    uploadBrowse: 'Browse files',
    uploadRemove: 'Remove {name}',
    uploadTooLarge: '{name} is larger than {limit}',
    uploadWrongType: '{name} is not an accepted file type',
    uploadUploading: 'Uploading',
    uploadDone: 'Uploaded',
    uploadFailed: 'Upload failed',
    approvalPending: 'Pending',
    approvalCurrent: 'Awaiting decision',
    approvalApproved: 'Approved',
    approvalRejected: 'Rejected',
    approvalSkipped: 'Skipped',
    approvalChain: 'Approval chain',
    approvalStep: 'Step {n} of {total}',
    approvalNotReached: 'Not reached',
    approvalOutcomeApproved: 'Approved by everyone',
    approvalOutcomeRejected: 'Rejected',
    approvalOutcomeInProgress: 'Waiting for a decision',
    approvalOutcomePending: 'Not started',
    orgExpand: 'Expand {name}',
    orgCollapse: 'Collapse {name}',
    orgReports: '{count} reports',
    orgTree: 'Organization',
    orgNone: 'There is nobody in the organization yet',
    matrixAllowed: 'Allowed',
    matrixDenied: 'Not allowed',
    matrixGrant: 'Grant {permission} to {role}',
    matrixReadOnly: 'Read-only',
    matrixPermission: 'Permission',
    matrixScroll: 'Permission matrix, scrolls sideways',
    matrixGroupAll: 'Other',
} as const;

/** The name of one of the foundation strings. */
export type FoundationStringName = keyof typeof foundationStrings;

/** The text table a foundation component works with. */
export type FoundationStrings = Record<FoundationStringName, string>;

/**
 * The foundation strings with the element's own `strings` property laid over them.
 *
 * Only string values of known names are taken, so a typo in an application's table falls back to the default text
 * rather than rendering nothing.
 */
export function readFoundationStrings(element: ExternalComponent): FoundationStrings {
    const supplied = element.properties.strings;
    const result: FoundationStrings = { ...foundationStrings };
    if (typeof supplied !== 'object' || supplied === null || Array.isArray(supplied)) return result;

    for (const [name, value] of Object.entries(supplied as Record<string, unknown>)) {
        if (name in foundationStrings && typeof value === 'string') result[name as FoundationStringName] = value;
    }

    return result;
}

/** Replaces each `{name}` in a string with the value of the same name, leaving an unknown placeholder visible rather than blank. */
export function formatText(text: string, values: Record<string, string | number> = {}): string {
    return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => (name in values ? String(values[name]) : placeholder));
}
