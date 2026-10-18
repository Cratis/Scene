// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { inboxScreenTemplate } from '@cratis/scene.blueprint.default';
import { CustomerPortalQuery, fromQuery, localeOfData } from '../customerPortalQueries';
import { customerPortalMetadata, component } from '../customerPortalParts';

/** The support inbox: the conversations with the supplier, the open message beside them and its history beneath. */
export const portalSupportTemplate: ScreenTemplate = {
    name: 'PortalSupport',
    fitsSlot: 'content',
    slots: inboxScreenTemplate.slots,
    arrangement: inboxScreenTemplate.arrangement,
    content: {
        header: [component('PortalSupport-header', 'pageHeader', { title: 'Support', subtitle: 'Your conversations with us' })],
        queue: [component('PortalSupport-queue', 'inboxList', { label: 'Conversations', messages: fromQuery(CustomerPortalQuery.PortalMessages), urlKey: 'msg', ...localeOfData })],
        message: [component('PortalSupport-message', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(CustomerPortalQuery.PortalMessageSections), values: fromQuery(CustomerPortalQuery.PortalMessageValues, '0'), ...localeOfData })],
        history: [component('PortalSupport-history', 'activityFeed', { label: 'History', entries: fromQuery(CustomerPortalQuery.PortalMessageHistory), ...localeOfData })],
    },
    displayName: 'Portal support inbox',
    description: 'Conversations with the supplier: the queue grouped by day with unread told in words, the open message and its history.',
    metadata: customerPortalMetadata('PortalSupport', 'Inbox', [TemplateScope.Module, TemplateScope.Feature]),
};
