// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DragEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { BoardCard, BoardColumn, BoardLane, cardsOf, lanesByAssignee, moveCard, overLimit, readCardFieldList, readCardRows, readCards, readColumnsOfBoard, totalOf } from './boardModel';
import { ComponentState, readComponentState } from './ComponentState';
import { formatNumber, readLocale, readNumberFormat } from './formatting';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import { FoundationFrame } from './StateFrame';

const optional = <Key extends string>(key: Key, value: unknown): { [Name in Key]?: string } =>
    (typeof value === 'string' && value.length > 0 ? { [key]: value } : {}) as { [Name in Key]?: string };

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
 * Rows that come from a query with a shape of their own need no card shape: `cardId`, `cardTitle`, `cardColumn` and `cardAssignee` name the row properties that
 * say what a card is, and `cardFields` lists up to three more to show on it (`field`, `label`) - a product's `productId`, `name` and `status`, with its `price`.
 *
 * `swimlane` set to `assignee` lays the board out in lanes, one for each person (in the order they first appear, the unassigned last), each across the same
 * columns: a task is moved between columns within its lane, by dragging or by its Move-to menu, and each column's total and count are for the lane.
 *
 * `selectionMode` set to `single` makes each card's title a toggle button (mouse, Enter or Space; Escape clears). `selectedItem` publishes the original
 * query row, even with mapped fields and after a move, or null when cleared or removed from the supplied cards. Selection defaults to `none`.
 */
export function KanbanBoard({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const columns = useMemo(() => readColumnsOfBoard(element.properties.columns), [element.properties.columns]);
    const mapping = useMemo(() => ({
        ...optional('id', element.properties.cardId), ...optional('title', element.properties.cardTitle), ...optional('column', element.properties.cardColumn),
        ...optional('assignee', element.properties.cardAssignee), fields: readCardFieldList(element.properties.cardFields),
    }), [element.properties.cardId, element.properties.cardTitle, element.properties.cardColumn, element.properties.cardAssignee, element.properties.cardFields]);
    const supplied = useMemo(() => readCards(element.properties.cards, mapping), [element.properties.cards, mapping]);
    const suppliedKey = JSON.stringify(supplied);
    const rows = useMemo(() => readCardRows(element.properties.cards, mapping), [element.properties.cards, mapping]);
    const selectable = element.properties.selectionMode === 'single';
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const selectedCard = selectable ? supplied.find(card => card.id === selectedId) : undefined;
    const selectedItem = selectedCard ? rows.get(selectedCard.id) ?? null : null;
    const selectedKey = JSON.stringify(selectedItem);
    const latestSelection = useRef(selectedItem);
    latestSelection.current = selectedItem;
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

    useEffect(() => {
        setCards(supplied);
    }, [suppliedKey]);
    useEffect(() => {
        setSelectedId(current => selectable && supplied.some(card => card.id === current) ? current : undefined);
    }, [suppliedKey, selectable]);
    useEffect(() => {
        bindingOutputs?.setOutput('selectedItem', latestSelection.current);
    }, [bindingOutputs, selectedKey]);
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
    const select = (card: BoardCard) => {
        const next = selectedId === card.id ? undefined : card.id;
        setSelectedId(next);
        setAnnouncement(next === undefined ? strings.boardSelectionCleared : formatText(strings.boardSelected, { title: card.title }));
    };
    const clearWithEscape = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Escape') return;
        if (!(event.target instanceof HTMLElement)) return;
        if (event.target.closest('input, select, textarea, [contenteditable]')) return;
        if (!selectable || selectedId === undefined) return;
        event.stopPropagation();
        setSelectedId(undefined);
        setAnnouncement(strings.boardSelectionCleared);
    };
    const lanes: BoardLane[] = swimlane ? lanesByAssignee(cards, people) : [];
    const drop = (event: DragEvent, to: string) => { event.preventDefault(); if (dragging) move(dragging, to); setDragging(undefined); };
    const toggle = (id: string) => setCollapsed(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

    const board = (scope: BoardCard[], Heading: 'h3' | 'h4', laneLabel?: string) => (
        <div className='foundation-board' onKeyDown={clearWithEscape}>
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
                                    <li key={card.id} className='foundation-board-card' data-selected={selectedCard?.id === card.id} draggable={!locked} onDragStart={() => setDragging(card.id)} onDragEnd={() => setDragging(undefined)}>
                                        {selectable ? <button type='button' className='foundation-board-card-select' aria-label={formatText(strings.boardSelectCard, { title: card.title })} aria-pressed={selectedCard?.id === card.id} onClick={() => select(card)}>{card.title}</button> : <strong>{card.title}</strong>}
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
