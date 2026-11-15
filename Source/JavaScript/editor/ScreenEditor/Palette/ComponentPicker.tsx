// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { beginMenuDrag, endMenuDrag } from '../Menu/menuDrag';
import { setPaletteDrag } from '../Surface/dragPayload';
import { buildPickerView, frequentGroupId, highlightParts, visibleRows, type PickerEntry, type PickerGroup } from './componentPickerModel';
import type { ComponentPickerMemory } from './componentPickerStorage';
import './ComponentPicker.css';

// The words the picker shows.
export interface ComponentPickerStrings {
    heading: string;
    filterPlaceholder: string;
    filterLabel: string;
    frequentlyUsed: string;
    groupsHint: string;
    nothingMatches: string;

    // The hint beside a component a keyword brought in: "…Tl matches "ta" via keyword "table"".
    viaKeyword: (badge: string, query: string, keyword: string) => string;
    addLabel: (component: string) => string;
}

export const defaultComponentPickerStrings: ComponentPickerStrings = {
    heading: 'Components',
    filterPlaceholder: 'Filter components...',
    filterLabel: 'Filter components',
    frequentlyUsed: 'Frequently used',
    groupsHint: 'Groups without a match are hidden. Matching groups expand while a filter is active.',
    nothingMatches: 'No component matches.',
    viaKeyword: (badge, query, keyword) => `...${badge} matches "${query}" via keyword "${keyword}"`,
    addLabel: component => `Add ${component}`,
};

export interface ComponentPickerProps {
    entries: readonly PickerEntry[];
    memory: ComponentPickerMemory;
    strings?: ComponentPickerStrings;

    // Adds the entry at the current selection. Usage is recorded by whoever adds it to the canvas, not here (PICK4).
    onAdd: (entry: PickerEntry) => void;

    // Called with the keys of everything that was used after each add, so the picker reorders Frequently used without a reload.
    usageVersion?: number;
}

const stars = '\u2605';

// The toolbox (spec section 9): a filter, then Frequently used and one accordion group per category, each with its count; a component is a two-letter
// badge and its name, with the package it comes from as a secondary label. Click or Enter adds it at the selection; it can also be dragged onto the
// screen. Up and Down move through the groups and components, Enter adds or opens, and "/" puts the cursor in the filter. A filter lists only the matches,
// hides the groups with none and opens those that remain, then gives the author's own open and closed groups back when it is cleared.
export const ComponentPicker = ({ entries, memory, strings = defaultComponentPickerStrings, onAdd, usageVersion = 0 }: ComponentPickerProps) => {
    const [query, setQuery] = useState('');
    const [groups, setGroups] = useState(() => memory.readGroups());
    const filter = useRef<HTMLInputElement>(null);
    const root = useRef<HTMLDivElement>(null);
    const filterId = useId();

    // The usage is read when it may have changed - on every add - and not on every keystroke.
    const usage = useMemo(() => ({ ...memory.readUsage() }), [memory, usageVersion]);
    const view = useMemo(() => buildPickerView({ entries, usage, query, groups, frequentTitle: strings.frequentlyUsed }), [entries, usage, query, groups, strings.frequentlyUsed]);
    const filtering = query.trim().length > 0;

    const toggle = useCallback((group: PickerGroup) => {
        if (filtering) return;
        setGroups(current => {
            const next = { ...current, [group.id]: !group.expanded };
            memory.writeGroups(next);
            return next;
        });
    }, [filtering, memory]);

    // Everything that can take the keyboard focus, in the order it is drawn: the filter's results, group headers and rows alike.
    const focusables = (): HTMLElement[] => [...(root.current?.querySelectorAll<HTMLElement>('[data-picker-focus]') ?? [])];
    const move = (from: HTMLElement | null, step: 1 | -1) => {
        const list = focusables();
        const at = from ? list.indexOf(from) : -1;
        const next = list[Math.min(Math.max(at + step, 0), list.length - 1)];
        next?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const typing = target === filter.current;
        if (event.key === '/' && !typing) {
            event.preventDefault();
            filter.current?.focus();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            move(typing ? null : target, 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const list = focusables();
            if (typing) return;
            if (list.indexOf(target) <= 0) filter.current?.focus(); else move(target, -1);
        } else if (event.key === 'Escape' && typing && query !== '') {
            event.stopPropagation();
            setQuery('');
        }
    };

    const startDrag = (entry: PickerEntry, event: DragEvent<HTMLButtonElement>) => {
        setPaletteDrag(event, entry.payload, entry.label);
        // The drawer this sits in steps out of the way of the screen while something is being dragged out of it.
        beginMenuDrag(event.currentTarget);
    };
    const endDrag = (event: DragEvent<HTMLButtonElement>) => {
        endMenuDrag(event.currentTarget);
    };

    const rows = visibleRows(view);

    return (
        <div ref={root} className='studio-component-picker' role='region' aria-label={strings.heading} onKeyDown={onKeyDown}>
            <input
                ref={filter} id={filterId} type='search' className='studio-component-picker__filter' value={query} placeholder={strings.filterPlaceholder} aria-label={strings.filterLabel}
                autoComplete='off' spellCheck={false} onChange={event => setQuery(event.target.value)} />

            {view.length === 0 && <p className='studio-component-picker__empty' role='status'>{strings.nothingMatches}</p>}

            <div className='studio-component-picker__groups'>
                {view.map(group => (
                    <section key={group.id} className='studio-component-picker__group' data-group={group.id} data-expanded={group.expanded}>
                        <button
                            type='button' data-picker-focus className='studio-component-picker__group-header' aria-expanded={group.expanded} aria-controls={`${filterId}-${group.id}`}
                            onClick={() => toggle(group)}>
                            <span className='studio-component-picker__chevron' aria-hidden='true'>{group.frequent ? <span className='studio-component-picker__star'>{stars}</span> : group.expanded ? '\u25BC' : '\u25B6'}</span>
                            <span className='studio-component-picker__group-title'>{group.title}</span>
                            <span className='studio-component-picker__count' aria-label={`${group.count}`}>{group.count}</span>
                        </button>
                        {group.expanded && (
                            <ul id={`${filterId}-${group.id}`} className='studio-component-picker__rows'>
                                {group.rows.map(({ entry, match }) => (
                                    <li key={entry.key}>
                                        <button
                                            type='button' data-picker-focus data-component={entry.key} draggable className='studio-component-picker__row' title={strings.addLabel(entry.label)}
                                            onClick={() => onAdd(entry)} onDragStart={event => startDrag(entry, event)} onDragEnd={endDrag}>
                                            <span className='studio-component-picker__badge' aria-hidden='true'>{entry.badge}</span>
                                            <span className='studio-component-picker__label'>
                                                <span className='studio-component-picker__name'>
                                                    {highlightParts(entry.label, match.ranges).map((part, index) => part.marked ? <mark key={index}>{part.text}</mark> : <span key={index}>{part.text}</span>)}
                                                </span>
                                                {match.via === 'keyword' && match.keyword && (
                                                    <span className='studio-component-picker__hint'>{strings.viaKeyword(entry.badge, query.trim(), match.keyword)}</span>
                                                )}
                                            </span>
                                            {entry.packageTitle && <span className='studio-component-picker__package'>{entry.packageTitle}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            {filtering && view.length > 0 && <p className='studio-component-picker__note'>{strings.groupsHint}</p>}
            <span hidden data-rows={rows.length} data-frequent={frequentGroupId} />
        </div>
    );
};
