// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InboxFilter, InboxGroup, categoriesOf, filterMessages, groupMessages, groupOf, isUnread, moveMessage, readInboxMessages, unreadCount } from '../foundation';

const messages = readInboxMessages([
    { id: 'a', title: 'Old', received: '2026-03-01T10:00:00Z', category: 'Mention', unread: true },
    { id: 'b', title: 'Today', received: '2026-03-10T09:00:00Z', category: 'Approval', unread: true },
    { id: 'c', title: 'Yesterday', received: '2026-03-09T09:00:00Z', category: 'Approval' },
    { id: 'a', title: 'Repeated' },
    { id: 'd' },
]);

describe('when reading the messages of an inbox', () => {
    it('should drop what cannot be shown and put the newest first', () => messages.map(message => message.id).should.deep.equal(['b', 'c', 'a']));

    it('should count the unread, with the reader\'s own marks laid over the data', () => {
        unreadCount(messages, {}).should.equal(2);
        unreadCount(messages, { b: 'read', c: 'unread' }).should.equal(2);
        isUnread(messages[0], { b: 'read' }).should.equal(false);
    });

    it('should filter by unread and by category', () => {
        filterMessages(messages, InboxFilter.Unread, '', {}).map(message => message.id).should.deep.equal(['b', 'a']);
        filterMessages(messages, InboxFilter.All, 'Approval', {}).map(message => message.id).should.deep.equal(['b', 'c']);
        filterMessages(messages, InboxFilter.Unread, 'Approval', { b: 'read' }).should.deep.equal([]);
    });

    it('should list the categories in the order they first appear', () => categoriesOf(messages).should.deep.equal(['Approval', 'Mention']));

    it('should group by day relative to today, including across a month end', () => {
        messages.map(message => groupOf(message, '2026-03-10')).should.deep.equal([InboxGroup.Today, InboxGroup.Yesterday, InboxGroup.Earlier]);
        groupOf({ ...messages[0], received: '2026-02-28T23:59:00Z' }, '2026-03-01').should.equal(InboxGroup.Yesterday);
        groupMessages(messages.slice(1), '2026-03-10').map(entry => entry.group).should.deep.equal([InboxGroup.Yesterday, InboxGroup.Earlier]);
    });

    it('should move between messages with the arrow, J, K, Home and End keys and stop at the ends', () => {
        moveMessage(messages, 'b', 'ArrowDown')!.should.equal('c');
        moveMessage(messages, 'a', 'ArrowDown')!.should.equal('a');
        moveMessage(messages, 'c', 'k')!.should.equal('b');
        moveMessage(messages, 'b', 'ArrowUp')!.should.equal('b');
        moveMessage(messages, 'c', 'End')!.should.equal('a');
        moveMessage(messages, undefined, 'Home')!.should.equal('b');
        (moveMessage(messages, 'b', 'x') === undefined).should.equal(true);
        (moveMessage([], undefined, 'ArrowDown') === undefined).should.equal(true);
    });
});
