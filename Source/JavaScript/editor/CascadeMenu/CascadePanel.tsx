// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { CascadeEntry } from './CascadeEntry';
import { CascadeEntryKind } from './CascadeEntryKind';
import { CascadeFilter } from './CascadeFilter';
import { OpenSubmenu } from './OpenSubmenu';
import { type PanelRect, placePanelBelow, placePanelBeside } from './placeCascadePanel';

export interface CascadePanelProps {
    /** The rows of the panel. */
    entries: CascadeEntry[];

    /** How deep the panel is: 0 for the first. */
    depth: number;

    /** Where the panel opens: the control that opened the menu for the first panel, the opening row for the rest. */
    anchor: PanelRect;

    /** The submenus open at this moment, outermost first. */
    openPath: OpenSubmenu[];

    /** The accessible name of the panel. */
    label: string;

    /** The filter field, on the first panel only. */
    filter?: CascadeFilter;

    /** Opens a submenu from a row. */
    onOpen: (depth: number, submenu: OpenSubmenu) => void;

    /** Closes every submenu from `depth` inward. */
    onCollapse: (depth: number) => void;

    /** Called when something was chosen. */
    onChosen: () => void;
}

/** One panel of a cascading menu: headings, rows, and the rows that open the next panel. */
export const CascadePanel = ({ entries, depth, anchor, openPath, label, filter, onOpen, onCollapse, onChosen }: CascadePanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const [position, setPosition] = useState<{ top: number; left: number }>();

    useLayoutEffect(() => {
        const size = panelRef.current?.getBoundingClientRect();
        if (!size) return;
        const bounds = { width: window.innerWidth, height: window.innerHeight };
        setPosition(depth === 0 ? placePanelBelow(anchor, size, bounds) : placePanelBeside(anchor, size, bounds));
    }, [anchor, depth, entries]);

    // The first panel takes focus as soon as it is shown - it stays hidden until it has been placed, and a hidden control cannot be focused.
    useEffect(() => {
        if (depth === 0 && position) panelRef.current?.querySelector<HTMLElement>('[data-cascade-focusable]')?.focus();
    }, [depth, position === undefined]);

    const open = openPath[depth];
    const child = open ? entries.find(entry => entry.kind === CascadeEntryKind.Submenu && entry.id === open.id) : undefined;

    return (
        <>
            <div ref={panelRef} className='studio-cascade-menu__panel' data-cascade-depth={depth}
                style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden' }}>
                {filter && <input type='search' className='studio-cascade-menu__filter' role='searchbox' aria-controls={menuId} aria-label={filter.placeholder}
                    placeholder={filter.placeholder} value={filter.value} data-cascade-focusable='' onChange={event => filter.onChange(event.target.value)} />}
                <div id={menuId} className='studio-cascade-menu__list' role='menu' aria-label={label}>
                {entries.map(entry => {
                    switch (entry.kind) {
                        case CascadeEntryKind.Heading:
                            return <div key={entry.id} className='studio-cascade-menu__heading' role='presentation' data-cascade-entry={entry.id}>{entry.label}</div>;
                        case CascadeEntryKind.Subheading:
                            return <div key={entry.id} className='studio-cascade-menu__subheading' role='presentation' data-cascade-entry={entry.id}>{entry.label}</div>;
                        case CascadeEntryKind.Separator:
                            return <div key={entry.id} className='studio-cascade-menu__separator' role='separator' />;
                        case CascadeEntryKind.Note:
                            return <div key={entry.id} className='studio-cascade-menu__note' role='presentation' data-cascade-entry={entry.id}>{entry.label}</div>;
                        case CascadeEntryKind.Submenu:
                            return (
                                <button key={entry.id} type='button' role='menuitem' aria-haspopup='menu' aria-expanded={open?.id === entry.id}
                                    className={`studio-cascade-menu__row studio-cascade-menu__row--submenu${open?.id === entry.id ? ' studio-cascade-menu__row--open' : ''}`}
                                    data-cascade-focusable='' data-cascade-entry={entry.id}
                                    onMouseEnter={event => onOpen(depth, { id: entry.id, rect: toRect(event.currentTarget) })}
                                    onClick={event => onOpen(depth, { id: entry.id, rect: toRect(event.currentTarget) })}>
                                    <span className='studio-cascade-menu__label'>{entry.label}</span>
                                    <span className='studio-cascade-menu__chevron' aria-hidden='true'>▸</span>
                                </button>
                            );
                        default:
                            return (
                                <div key={entry.id} className='studio-cascade-menu__line' role='presentation' onMouseEnter={() => onCollapse(depth)}>
                                    <button type='button' role={entry.checked === undefined ? 'menuitem' : 'menuitemradio'} aria-checked={entry.checked}
                                        aria-disabled={entry.disabledReason !== undefined} title={entry.disabledReason}
                                        className={`studio-cascade-menu__row${entry.checked ? ' studio-cascade-menu__row--current' : ''}${entry.disabledReason ? ' studio-cascade-menu__row--disabled' : ''}`}
                                        data-cascade-focusable='' data-cascade-entry={entry.id}
                                        onClick={() => { if (entry.disabledReason) return; entry.onActivate(); onChosen(); }}>
                                        <span className='studio-cascade-menu__check' aria-hidden='true'>{entry.checked ? '✓' : ''}</span>
                                        <span className='studio-cascade-menu__text'>
                                            <span className='studio-cascade-menu__label'>{entry.label}</span>
                                            {entry.description && <span className='studio-cascade-menu__description'>{entry.description}</span>}
                                        </span>
                                        {entry.trailing && <span className='studio-cascade-menu__trailing'>{entry.trailing}</span>}
                                    </button>
                                    {entry.actions?.map((action, index) => (
                                        <button key={index} type='button' className='studio-cascade-menu__secondary' data-cascade-focusable='' data-cascade-entry={`${entry.id}:action-${index}`}
                                            title={action.label} aria-label={`${action.label}: ${entry.label}`}
                                            onClick={() => { action.onActivate(); if (action.closes) onChosen(); }}>
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            );
                    }
                })}
                </div>
            </div>
            {child && child.kind === CascadeEntryKind.Submenu && (
                <CascadePanel entries={child.entries} depth={depth + 1} anchor={open!.rect} openPath={openPath} label={child.label}
                    onOpen={onOpen} onCollapse={onCollapse} onChosen={onChosen} />
            )}
        </>
    );
};

function toRect(element: HTMLElement): PanelRect {
    const { top, left, width, height } = element.getBoundingClientRect();
    return { top, left, width, height };
}
