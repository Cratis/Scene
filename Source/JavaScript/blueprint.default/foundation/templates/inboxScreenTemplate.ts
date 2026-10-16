// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The inbox screen (spec Part B 2.12): the queue of things that want attention - requests to decide, notifications, mentions - beside the open message. The queue is
 * grouped by day with unread told in words and moves by keyboard; the open message, the filter and the category live in the address. On a phone the two stack.
 */
export const inboxScreenTemplate: ScreenTemplate = {
    name: 'InboxScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'queue' }, { name: 'message' }, { name: 'history' }],
    arrangement: {
        root: column([slotLeaf('header'), grid([slotLeaf('queue'), column([slotLeaf('message'), slotLeaf('history')], 16, { span: 2 })], 3, 16)], 12),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('queue'), slotLeaf('message'), slotLeaf('history')], 16) }],
    },
    content: {
        header: [component('inbox-header', 'pageHeader', { title: 'Inbox', subtitle: 'What is waiting for you' })],
        queue: [component('inbox-queue', 'inboxList', { label: 'Inbox', messages: fromQuery('InboxMessages'), urlKey: 'msg' })],
        message: [component('inbox-message', 'formScreenBody', { mode: 'readOnly', sections: fromQuery('InboxMessageSections'), values: fromQuery('InboxMessageValues', '0') })],
        history: [component('inbox-history', 'activityFeed', { label: 'History', entries: fromQuery('Activity') })],
    },
    displayName: 'Inbox',
    description: 'The queue of messages that want attention beside the open message, with unread state and keyboard movement.',
    metadata: { ...foundationTemplateProvenance, type: 'Inbox', category: 'Foundation / Inbox', thumbnail: thumbnailOf('InboxScreen') },
};
