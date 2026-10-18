// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { inboxScreenTemplate } from '@cratis/scene.blueprint.default';
import { ContractsQuery, fromQuery, localeOfData } from '../contractsQueries';
import { contractsMetadata, component } from '../contractsParts';

/** The review inbox: the contracts that need a review, a signature or a renewal decision, the open message beside them and its history beneath. */
export const contractsReviewTemplate: ScreenTemplate = {
    name: 'ContractsReview',
    fitsSlot: 'content',
    slots: inboxScreenTemplate.slots,
    arrangement: inboxScreenTemplate.arrangement,
    content: {
        header: [component('ContractsReview-header', 'pageHeader', { title: 'Needs attention', subtitle: 'Review, sign or renew' })],
        queue: [component('ContractsReview-queue', 'inboxList', { label: 'Needs attention', messages: fromQuery(ContractsQuery.ContractMessages), urlKey: 'msg', ...localeOfData })],
        message: [component('ContractsReview-message', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(ContractsQuery.ContractMessageSections), values: fromQuery(ContractsQuery.ContractMessageValues, '0'), ...localeOfData })],
        history: [component('ContractsReview-history', 'activityFeed', { label: 'History', entries: fromQuery(ContractsQuery.ContractMessageHistory), ...localeOfData })],
    },
    displayName: 'Contracts review inbox',
    description: 'What needs review, signature or a renewal decision: the queue grouped by day with unread told in words, the open message and its history.',
    metadata: contractsMetadata('ContractsReview', 'Inbox', [TemplateScope.Module, TemplateScope.Feature]),
};
