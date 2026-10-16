// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind } from '@cratis/scene.model';

/**
 * A property taken from a query result - never a value. A template declares *where* its data comes from and the sample-data pack, or the real
 * query, supplies the rows (spec SD1); `path` reaches into the result (`0.value` is the first row's `value`, an empty path is the whole result).
 */
export const fromQuery = (query: string, path = ''): BindingExpression => ({ kind: BindingSourceKind.QueryResult, query, path });

/** The queries of the approvals application, each a shape the sample-data packs supply rows for. */
export const ApprovalsQuery = {
    /** One row: the `locale` and the `currency` the figures and dates are formatted in. */
    Settings: 'ApprovalsSettings',
    Inbox: 'InboxRequests',
    InboxColumns: 'InboxColumns',
    InboxFilterFields: 'InboxFilterFields',
    InboxViews: 'InboxViews',
    MyRequests: 'MyRequests',
    MyRequestColumns: 'MyRequestColumns',
    MyRequestFilterFields: 'MyRequestFilterFields',
    MyRequestViews: 'MyRequestViews',
    MyRequestColumnChoices: 'MyRequestColumnChoices',
    MyRequestSelection: 'MyRequestSelection',
    AllRequests: 'AllRequests',
    AllRequestColumns: 'AllRequestColumns',
    AllRequestFilterFields: 'AllRequestFilterFields',
    AllRequestViews: 'AllRequestViews',
    AllRequestColumnChoices: 'AllRequestColumnChoices',
    AllRequestSelection: 'AllRequestSelection',
    RequestTypes: 'RequestTypes',
    RequestTypeColumns: 'RequestTypeColumns',
    RequestTypeFilterFields: 'RequestTypeFilterFields',
    RequestTypeViews: 'RequestTypeViews',
    RequestTypeColumnChoices: 'RequestTypeColumnChoices',
    RequestTypeSelection: 'RequestTypeSelection',
    WizardSteps: 'RequestWizardSteps',
    TypeSections: 'RequestTypeSections',
    DetailSections: 'RequestDetailSections',
    ReviewSections: 'RequestReviewSections',
    ReviewValues: 'RequestReviewValues',
    Request: 'RequestRecord',
    RequestSummary: 'RequestSummary',
    RequestSections: 'RequestSections',
    Chain: 'RequestChain',
    Attachments: 'RequestAttachments',
    AttachmentColumns: 'AttachmentColumns',
    Comments: 'RequestComments',
    RequestTabs: 'RequestTabs',
    DecisionSections: 'DecisionSections',
    TypeEditorSections: 'RequestTypeEditorSections',
    FormErrors: 'ApprovalsFormErrors',
} as const;

/** The locale and currency of the data, bound onto every component that formats a figure or a date. */
export const localeOfData = { locale: fromQuery(ApprovalsQuery.Settings, '0.locale') };
export const currencyOfData = { ...localeOfData, currency: fromQuery(ApprovalsQuery.Settings, '0.currency') };
