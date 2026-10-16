// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { ApprovalsQuery, currencyOfData, fromQuery, localeOfData } from '../approvalsQueries';
import { actionButton, approvalsMetadata, component, opensDialog, withBehaviors } from '../approvalsParts';

/**
 * The request page: the foundation `RecordPage` with the request's title, its key facts under it - status, who asked, the amount - and the **approval chain**
 * as the page's first block: the steps in order, who decides each and where it stands. A rejection stops the chain and the steps after it read "Not reached"; the
 * outcome is said in words above the steps. The request's fields, its **attachments** and its **comments** (the page's activity) follow, and the decision
 * buttons open the decision dialog.
 */
export const requestPageTemplate: ScreenTemplate = {
    name: 'RequestPage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('request-header', 'pageHeader', { title: fromQuery(ApprovalsQuery.Request, '0.title'), subtitle: fromQuery(ApprovalsQuery.Request, '0.reference') }, {
            actions: [
                withBehaviors(actionButton('request-approve', 'Approve', 'primary'), opensDialog('DecisionDialog')),
                withBehaviors(actionButton('request-reject', 'Reject', 'secondary'), opensDialog('DecisionDialog')),
                withBehaviors(actionButton('request-changes', 'Request changes', 'secondary'), opensDialog('DecisionDialog')),
            ],
        })],
        summary: [
            component('request-status', 'statusChip', { status: fromQuery(ApprovalsQuery.RequestSummary, '0.status'), tone: fromQuery(ApprovalsQuery.RequestSummary, '0.tone') }),
            component('request-amount', 'statCard', { label: fromQuery(ApprovalsQuery.RequestSummary, '0.amountLabel'), value: fromQuery(ApprovalsQuery.RequestSummary, '0.amount'), format: 'currency', fractionDigits: 0, ...currencyOfData }),
            component('request-people', 'avatarStack', { people: fromQuery(ApprovalsQuery.RequestSummary, '0.people') }),
        ],
        tabs: [component('request-tabs', 'tabSet', { tabs: fromQuery(ApprovalsQuery.RequestTabs), urlKey: 'tab', label: 'Request sections' })],
        main: [
            component('request-chain', 'approvalChainStepper', { steps: fromQuery(ApprovalsQuery.Chain), label: 'Approval chain', ...localeOfData }),
            component('request-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(ApprovalsQuery.RequestSections), values: fromQuery(ApprovalsQuery.Request, '0'), ...localeOfData }),
        ],
        related: [component('request-attachments', 'dataList', { label: 'Attachments', rows: fromQuery(ApprovalsQuery.Attachments), columns: fromQuery(ApprovalsQuery.AttachmentColumns), titleField: 'name', pageSize: 5, ...localeOfData })],
        activity: [component('request-comments', 'activityFeed', { label: 'Comments', entries: fromQuery(ApprovalsQuery.Comments), ...localeOfData })],
        aside: [],
    },
    displayName: 'Request page',
    description: 'One request: summary, approval chain, fields, attachments and comments, and the decision buttons.',
    metadata: approvalsMetadata('RequestPage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
