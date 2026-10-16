// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderFoundation, violationsIn } from '../for_foundation/given';

const messages = [
    { id: 'm1', title: 'Leave request: Ada', summary: 'Five days', sender: 'Ada', received: '2026-03-10T08:30:00Z', category: 'Approval', tone: 'warning', unread: true },
    { id: 'm2', title: 'Expense approved', sender: 'Finance', received: '2026-03-09T15:00:00Z', category: 'Notification', tone: 'success' },
    { id: 'm3', title: 'Mentioned in Launch plan', sender: 'Grace', received: '2026-03-02T10:00:00Z', category: 'Mention', tone: 'info', unread: true },
];
const inbox = (properties: Record<string, unknown> = {}) => renderFoundation('inboxList', { messages, today: '2026-03-10', locale: 'en-GB', ...properties });

// Spec Part B 2.12: the inbox - the queue of things that want attention, usable by keyboard, with unread told in words.
describe('when using the inbox', () => {
    afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

    it('should group the messages by day', () => {
        inbox();
        ['Today', 'Yesterday', 'Earlier'].forEach(name => screen.getByRole('region', { name }));
    });

    it('should tell an unread message in words and count them', () => {
        inbox();
        within(screen.getByRole('region', { name: 'Today' })).getByText('Unread');
        screen.getByRole('button', { name: 'Unread (2)' });
    });

    it('should open a message, mark it read and keep it in the address', () => {
        inbox({ urlKey: 'msg' });
        fireEvent.click(screen.getByText('Leave request: Ada'));
        window.location.search.should.contain('msg=m1');
        screen.getByRole('button', { name: 'Unread (1)' });
    });

    it('should mark a message unread again', () => {
        inbox();
        fireEvent.click(screen.getByRole('button', { name: 'Mark as unread: Expense approved' }));
        screen.getByRole('button', { name: 'Unread (3)' });
    });

    it('should mark everything read at once', () => {
        inbox();
        fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
        screen.getByRole('button', { name: 'Unread (0)' });
    });

    it('should show only the unread messages when asked to', () => {
        inbox();
        fireEvent.click(screen.getByRole('button', { name: 'Unread (2)' }));
        (screen.queryByText('Expense approved') === null).should.equal(true);
        screen.getByText('Mentioned in Launch plan');
    });

    it('should narrow to a category', () => {
        inbox();
        fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'Mention' } });
        (screen.queryByText('Expense approved') === null).should.equal(true);
    });

    it('should move focus between messages with the arrow keys', () => {
        const { container } = inbox();
        const first = container.querySelector<HTMLElement>('[data-message="m1"]')!;
        first.focus();
        fireEvent.keyDown(first, { key: 'ArrowDown' });
        document.activeElement!.getAttribute('data-message')!.should.equal('m2');
    });

    it('should say there is nothing waiting when everything is filtered away', () => {
        inbox({ filter: 'unread', messages: [{ id: 'x', title: 'Read one' }] });
        screen.getByText('Nothing waiting for you');
    });

    it('should leave the inbox without an accessibility violation', async () => {
        const { container } = inbox();
        (await violationsIn(container)).should.deep.equal([]);
    });
});
