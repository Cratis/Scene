// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { ComponentState, readComponentState } from './ComponentState';
import { formatDate, readLocale } from './formatting';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { InboxFilter, InboxMessage, ReadOverrides, categoriesOf, filterMessages, groupMessages, isUnread, moveMessage, readInboxFilter, readInboxMessages, unreadCount } from './inboxModel';
import { FoundationFrame } from './StateFrame';
import { statusToneIcons } from './StatusChip';
import { useUrlState } from './urlState';

/**
 * The `inboxList` component: the queue of things that want attention - requests to decide, notifications, mentions.
 *
 * `messages` (`id`, `title`, `summary`, `sender`, `received`, `category`, `tone`, `unread`) come from a query. The queue is grouped by day, unread messages are
 * told by the word "Unread" and a bold title (never only by weight or color), and the filter (All or Unread, with the count) and the category are kept in the
 * address under `urlKey` (`urlKey` + `Filter`, `urlKey` + `Category`), as is the open message under `urlKey`. Arrow keys (and J / K) move between messages,
 * Home and End jump to the ends, and opening a message marks it read; a message can be marked unread again, and everything can be marked read at once. The
 * reader's marks are kept for the session and published with the open message's id as the `value` output.
 */
export function InboxList({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const messages = useMemo(() => readInboxMessages(element.properties.messages), [element.properties.messages]);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const urlKey = readOptionalString(element, 'urlKey');
    const today = (readOptionalString(element, 'today') ?? new Date().toISOString()).slice(0, 10);
    const [openId, setOpenId] = useUrlState(urlKey, undefined);
    const [filterValue, setFilter] = useUrlState(urlKey === undefined ? undefined : `${urlKey}Filter`, readOptionalString(element, 'filter'));
    const [categoryValue, setCategory] = useUrlState(urlKey === undefined ? undefined : `${urlKey}Category`, undefined);
    const [overrides, setOverrides] = useState<ReadOverrides>({});
    const list = useRef<HTMLDivElement>(null);
    const state = readComponentState(element, messages.length > 0);
    const filter = readInboxFilter(filterValue);
    const categories = categoriesOf(messages);
    const category = categoryValue !== undefined && categories.includes(categoryValue) ? categoryValue : '';
    const shown = filterMessages(messages, filter, category, overrides);
    const open = messages.find(message => message.id === openId);
    const unread = unreadCount(messages, overrides);

    useValueOutput(bindingOutputs, open?.id ?? null);

    const mark = (message: InboxMessage, as: 'read' | 'unread') => setOverrides(current => ({ ...current, [message.id]: as }));
    const choose = (message: InboxMessage, focus = false) => {
        setOpenId(message.id);
        if (isUnread(message, overrides)) mark(message, 'read');
        interactions?.onSelect?.();
        if (focus) requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`[data-message="${CSS.escape(message.id)}"]`)?.focus());
    };
    const onKeyDown = (event: KeyboardEvent) => {
        const target = moveMessage(shown, (event.target as HTMLElement).closest<HTMLElement>('[data-message]')?.dataset.message ?? openId, event.key);
        if (target === undefined) return;
        event.preventDefault();
        list.current?.querySelector<HTMLElement>(`[data-message="${CSS.escape(target)}"]`)?.focus();
    };
    const filters: [InboxFilter, string][] = [[InboxFilter.All, strings.inboxAll], [InboxFilter.Unread, formatText(strings.inboxUnreadCount, { count: unread })]];
    const groupLabels = { today: strings.inboxToday, yesterday: strings.inboxYesterday, earlier: strings.inboxEarlier };

    return (
        <FoundationFrame element={element} interactions={interactions} name='inbox' state={state} skeleton={[100, 100, 100]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <div>
                    <div className='foundation-inbox-toolbar'>
                        <div role='group' aria-label={strings.inboxFilter} className='foundation-calendar-buttons'>
                            {filters.map(([value, label]) => (
                                <button key={value} type='button' className='foundation-button' data-emphasis={filter === value ? 'primary' : 'secondary'} aria-pressed={filter === value}
                                    onClick={() => setFilter(value)}>{label}</button>
                            ))}
                        </div>
                        {categories.length > 1 && (
                            <select aria-label={strings.inboxCategory} className='foundation-inbox-category' value={category} onChange={event => setCategory(event.target.value)}>
                                <option value=''>{strings.inboxAllCategories}</option>
                                {categories.map(entry => <option key={entry} value={entry}>{entry}</option>)}
                            </select>
                        )}
                        <button type='button' className='foundation-button' data-emphasis='quiet' aria-disabled={unread === 0 || undefined}
                            onClick={() => unread > 0 && setOverrides(Object.fromEntries(messages.map(message => [message.id, 'read'])) as ReadOverrides)}>{strings.inboxMarkAllRead}</button>
                    </div>
                    <p className='foundation-visually-hidden' role='status'>{formatText(strings.inboxShowing, { count: shown.length })}</p>
                    {shown.length === 0 ? <p className='foundation-count'>{strings.inboxNothing}</p> : (
                        <div ref={list} className='foundation-inbox' onKeyDown={onKeyDown}>
                            {groupMessages(shown, today).map(({ group, messages: inGroup }) => (
                                <section key={group} aria-label={groupLabels[group]}>
                                    <h4>{groupLabels[group]}</h4>
                                    <ul className='foundation-inbox-list'>
                                        {inGroup.map(message => {
                                            const isNew = isUnread(message, overrides);
                                            return (
                                                <li key={message.id} className='foundation-inbox-item' data-unread={isNew} data-open={message.id === openId}>
                                                    <button type='button' className='foundation-inbox-message' data-message={message.id} aria-current={message.id === openId ? 'true' : undefined}
                                                        tabIndex={message.id === openId || (open === undefined && message.id === shown[0].id) ? 0 : -1} onClick={() => choose(message)}>
                                                        <span className='foundation-inbox-title'>
                                                            <FoundationIcon name={statusToneIcons[message.tone]} />
                                                            {isNew && <span className='foundation-chip' data-tone='info'>{strings.inboxUnread}</span>}
                                                            <span>{message.title}</span>
                                                        </span>
                                                        <span className='foundation-count'>{[message.sender, message.category, formatDate(message.received, locale)].filter(Boolean).join(' · ')}</span>
                                                        {message.summary && <span className='foundation-inbox-summary'>{message.summary}</span>}
                                                    </button>
                                                    <button type='button' className='foundation-button' data-emphasis='quiet' onClick={() => mark(message, isNew ? 'read' : 'unread')}>
                                                        {formatText(isNew ? strings.inboxMarkRead : strings.inboxMarkUnread, { title: message.title })}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </FoundationFrame>
    );
}
