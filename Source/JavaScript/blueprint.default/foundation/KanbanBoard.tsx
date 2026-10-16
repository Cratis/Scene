// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DragEvent, useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { BoardCard, BoardColumn, BoardLane, cardsOf, lanesByAssignee, moveCard, overLimit, readCards, readColumnsOfBoard, totalOf } from './boardModel';
import { ComponentState, readComponentState } from './ComponentState';
import { formatNumber, readLocale, readNumberFormat } from './formatting';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import { FoundationFrame } from './StateFrame';

/**
 * The `kanbanBoard` component: columns mapped to a status or stage, with cards that move between them.
 *
 * `columns` (`id`, `label`, `limit`) and `cards` (`id`, `title`, `column`, `assignee`, up to three `fields`, `badges`) come from a query. A card moves by
 * dragging it to another column **and** by its own "Move to" menu - the keyboard and screen-reader alternative, so nothing depends on a pointer
 * - and every move is announced. Columns show their count and a limit indicator that says "Over the limit" in words, and collapse to a
 * strip. With `totalField` naming a numeric card field (a deal's `amount`) each column's header also shows the total of that field over its cards, formatted
 * as `format` (`currency` with `currency`, for a pipeline of deals) in the `locale`; the totals follow a card as it moves. The new arrangement is published as `value` (the cards with their columns) for the screen to save; with `editPermission` not enabled the
 * board is read-only. A card whose column no longer exists is shown in the first column rather than lost.
 *
 * `swimlane` set to `assignee` lays the board out in lanes, one for each person (in the order they first appear, the unassigned last), each across the same
 * columns: a task is moved between columns within its lane, by dragging or by its Move-to menu, and each column's total and count are for the lane.
 */
export function KanbanBoard({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const columns = useMemo(() => readColumnsOfBoard(element.properties.columns), [element.properties.columns]);
    const supplied = useMemo(() => readCards(element.properties.cards), [element.properties.cards]);
    const suppliedKey = JSON.stringify(supplied);
    const [cards, setCards] = useState<BoardCard[]>(supplied);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [announcement, setAnnouncement] = useState('');
    const [dragging, setDragging] = useState<string | undefined>();
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, columns.length > 0);
    const totalField = typeof element.properties.totalField === 'string' ? element.properties.totalField : '';
    const locale = readLocale(element);
    const totalFormat = readNumberFormat(element);
    const currency = typeof element.properties.currency === 'string' && element.properties.currency.length > 0 ? element.properties.currency : undefined;
    const locked = readPermissionRule(element, 'editPermission') !== 'enabled';
    const swimlane = element.properties.swimlane === 'assignee';
    const people = useMemo(() => supplied.flatMap(card => (card.assignee ? [card.assignee] : [])), [suppliedKey]);

    useEffect(() => setCards(supplied), [suppliedKey]);
    useValueOutput(bindingOutputs, cards.map(card => ({ id: card.id, column: card.column })));

    const move = (id: string, to: string) => {
        const card = cards.find(candidate => candidate.id === id);
        const target = columns.find(column => column.id === to);
        const next = moveCard(columns, cards, id, to);
        if (!card || !target || next === cards) return;
        setCards(next);
        setAnnouncement(formatText(strings.boardMoved, { title: card.title, column: target.label }));
        interactions?.onChange?.();
    };
    const lanes: BoardLane[] = swimlane ? lanesByAssignee(cards, people) : [];
    const drop = (event: DragEvent, to: string) => { event.preventDefault(); if (dragging) move(dragging, to); setDragging(undefined); };
    const toggle = (id: string) => setCollapsed(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

    const board = (scope: BoardCard[], Heading: 'h3' | 'h4', laneLabel?: string) => (
        <div className='foundation-board'>
            {columns.map((column: BoardColumn) => {
                const inColumn = cardsOf(columns, scope, column.id);
                const closed = collapsed.has(column.id);
                const over = overLimit(column, cardsOf(columns, cards, column.id).length);
                return (
                    <section key={`${laneLabel ?? ''}:${column.id}`} className='foundation-board-column' data-collapsed={closed} data-over={over} aria-label={formatText(strings.boardColumn, { column: laneLabel === undefined ? column.label : `${laneLabel}, ${column.label}`, count: inColumn.length })}
                        onDragOver={event => { if (!locked) event.preventDefault(); }} onDrop={event => { if (!locked) drop(event, column.id); }}>
                        <header className='foundation-board-header'>
                            <button type='button' className='foundation-icon-button' aria-expanded={!closed} aria-label={formatText(closed ? strings.boardExpand : strings.boardCollapse, { column: column.label })} onClick={() => toggle(column.id)}>
                                <FoundationIcon name={closed ? 'chevron-right' : 'chevron-down'} />
                            </button>
                            <Heading>{column.label}</Heading>
                            <span className='foundation-count'>{inColumn.length}{column.limit > 0 ? ` / ${column.limit}` : ''}</span>
                            {totalField && <span className='foundation-board-total' data-total={totalOf(inColumn, totalField)}>{formatNumber(totalOf(inColumn, totalField), locale, totalFormat, currency, 0)}</span>}
                            {over && <span className='foundation-chip' data-tone='danger'><FoundationIcon name='alert' />{formatText(strings.boardWipExceeded, { limit: column.limit })}</span>}
                        </header>
                        {!closed && (
                            <ul className='foundation-board-cards'>
                                {inColumn.length === 0 && <li className='foundation-count'>{strings.boardNoCards}</li>}
                                {inColumn.map(card => (
                                    <li key={card.id} className='foundation-board-card' draggable={!locked} onDragStart={() => setDragging(card.id)} onDragEnd={() => setDragging(undefined)}>
                                        <strong>{card.title}</strong>
                                        {card.assignee && <span className='foundation-count'><FoundationIcon name='user' /> {card.assignee}</span>}
                                        {card.fields.map(field => <span key={field.label} className='foundation-board-field'><span className='foundation-count'>{field.label}</span> {field.value}</span>)}
                                        {card.badges.length > 0 && <span className='foundation-board-badges'>{card.badges.map(badge => <span key={badge} className='foundation-chip' data-tone='neutral'>{badge}</span>)}</span>}
                                        {!locked && (
                                            <select className='foundation-board-move' aria-label={formatText(strings.boardMoveCard, { title: card.title })} value={column.id} onChange={event => move(card.id, event.target.value)}>
                                                <option value={column.id} disabled>{strings.boardMoveTo}</option>
                                                {columns.filter(other => other.id !== column.id).map(other => <option key={other.id} value={other.id}>{other.label}</option>)}
                                            </select>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                );
            })}
        </div>
    );

    return (
        <FoundationFrame element={element} interactions={interactions} name='kanban-board' state={state} skeleton={[100, 100, 100]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <>
                    <div role='status' aria-live='polite' className='foundation-visually-hidden'>{announcement}</div>
                    {swimlane ? lanes.map(lane => (
                        <section key={lane.key} className='foundation-board-lane' aria-label={formatText(strings.boardLane, { assignee: lane.assignee || strings.boardUnassigned, count: lane.cards.length })}>
                            <h3 className='foundation-board-lane-title'>{lane.assignee || strings.boardUnassigned}<span className='foundation-count'>{lane.cards.length}</span></h3>
                            {board(lane.cards, 'h4', lane.assignee || strings.boardUnassigned)}
                        </section>
                    )) : board(cards, 'h3')}
                </>
            )}
        </FoundationFrame>
    );
}
