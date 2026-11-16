// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { LuAppWindow, LuChevronLeft, LuChevronRight, LuCopy, LuCornerDownRight, LuFilter, LuHash, LuLink, LuLock, LuPanelLeft, LuPanelRightOpen, LuSlidersHorizontal, LuToggleRight, LuTrash2, LuZap } from 'react-icons/lu';
import type { Rect } from '../Surface/dropRegionRects';
import { actionStateOf } from './designModeRules';
import { designModeActions, type DesignModeItem, type DesignModeReadOnlyAction, type DesignModeSubject } from './designModeTypes';
import type { DesignModeStrings } from './DesignModeStrings';
import { placeFloatingToolbar } from './placeFloatingToolbar';
import './DesignModeChrome.css';

// The choices an item makes in a popover - each is a chip on the toolbar - and the icon-only buttons, in the order the spec draws them
// (spec p12-1, p14-1): earlier, later, sub-item, duplicate, delete.
// The chips change per kind of outlet (StudioIssues#1330): a filter's parameter and control, the screen a tab shows, the field a stat shows, where an action opens.
const chipActions: readonly string[] = [
    designModeActions.target, designModeActions.slot, designModeActions.slice, designModeActions.opens, designModeActions.enabled, designModeActions.emphasis,
    designModeActions.sets, designModeActions.control, designModeActions.shows, designModeActions.valueFrom,
];
const buttonActions: readonly string[] = [designModeActions.moveEarlier, designModeActions.moveLater, designModeActions.addSubItem, designModeActions.duplicate, designModeActions.delete];

const chipIcon: Record<string, ReactNode> = {
    [designModeActions.target]: <LuLink aria-hidden='true' />,
    [designModeActions.slot]: <LuPanelLeft aria-hidden='true' />,
    [designModeActions.slice]: <LuZap aria-hidden='true' />,
    [designModeActions.opens]: <LuPanelRightOpen aria-hidden='true' />,
    [designModeActions.enabled]: <LuToggleRight aria-hidden='true' />,
    [designModeActions.sets]: <LuFilter aria-hidden='true' />,
    [designModeActions.control]: <LuSlidersHorizontal aria-hidden='true' />,
    [designModeActions.shows]: <LuAppWindow aria-hidden='true' />,
    [designModeActions.valueFrom]: <LuHash aria-hidden='true' />,
};

const buttonIcon: Record<string, ReactNode> = {
    [designModeActions.moveEarlier]: <LuChevronLeft aria-hidden='true' />,
    [designModeActions.moveLater]: <LuChevronRight aria-hidden='true' />,
    [designModeActions.addSubItem]: <LuCornerDownRight aria-hidden='true' />,
    [designModeActions.duplicate]: <LuCopy aria-hidden='true' />,
    [designModeActions.delete]: <LuTrash2 aria-hidden='true' />,
};

export interface FloatingItemToolbarProps {
    subject: DesignModeSubject;
    item: DesignModeItem;
    anchor: Rect;
    bounds: Rect;
    strings: DesignModeStrings;

    // Counts up when the title is to be typed over - a new item.
    renameToken: number;

    // What a chip says: the target an item links, the slice a button invokes.
    chipLabel: (actionId: string, item: DesignModeItem) => string;
    onRename: (label: string) => void;
    onAction: (actionId: string) => void;
    onChoice: (actionId: string, chip: HTMLElement) => void;
    readOnlyActions: readonly DesignModeReadOnlyAction[];
    onReadOnlyAction: (action: DesignModeReadOnlyAction) => void;

    // Gives the keyboard back to the surface, which is where Delete and Alt+arrows are heard.
    onLeave: () => void;
}

// The compact toolbar of the selected item (DM2-DM6): the title to rename it in place, the chips that open its choices as popovers, and the
// icon-only buttons that move, duplicate and delete it. It sits left-aligned under the item - or above it, for a toolbar button - and on the other
// side where there is no room. An item that may not be changed shows why instead, and what can be done about it.
export const FloatingItemToolbar = ({ subject, item, anchor, bounds, strings, renameToken, chipLabel, onRename, onAction, onChoice, readOnlyActions, onReadOnlyAction, onLeave }: FloatingItemToolbarProps) => {
    const root = useRef<HTMLDivElement>(null);
    const title = useRef<HTMLInputElement>(null);
    const [size, setSize] = useState({ width: 380, height: 100 });
    const [draft, setDraft] = useState(item.label);
    const [rovingIndex, setRovingIndex] = useState(0);

    const actions = subject.mode.itemToolbar;
    const compact = actions.some(action => action.compact === true);
    const hasChip = actions.some(action => chipActions.includes(action.id));
    const renames = actions.find(action => action.id === designModeActions.rename);
    const rename = renames && actionStateOf(renames, item);

    // A different item starts with its own title.
    useEffect(() => { setDraft(item.label); }, [item.id, item.label]);

    // A new item asks for its title to be typed over: the field takes focus with its text selected (spec p13-3).
    useEffect(() => {
        if (renameToken === 0 || !title.current) return;
        title.current.focus({ preventScroll: true });
        title.current.select();
    }, [renameToken, item.id]);

    useLayoutEffect(() => {
        // The toolbar sits inside the surface, so its size is its layout size: the page's scale (the board's zoom) is not part of it. That size is whole pixels, and where the
        // toolbar is placed decides at which sub-pixel its text is laid out, so it can flip between two neighbouring whole sizes; only a change of more than a pixel is a change.
        const box = root.current ? { width: root.current.offsetWidth, height: root.current.offsetHeight } : undefined;
        if (box && (Math.abs(box.width - size.width) > 1 || Math.abs(box.height - size.height) > 1)) setSize(box);
    });

    const prefer = subject.source.kind === 'elements' ? 'above' : 'below';
    const placed = placeFloatingToolbar({ anchor, bounds, size, prefer });

    // Enter and Escape settle the title and then leave the field; leaving blurs it, which must not commit what was just settled a second time.
    const settled = useRef(false);
    const commit = () => { const next = draft.trim(); if (next !== '' && next !== item.label) onRename(next); else setDraft(item.label); };
    const titleKeys = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') { event.preventDefault(); commit(); settled.current = true; onLeave(); }
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setDraft(item.label); settled.current = true; onLeave(); }
    };
    const leaveTitle = () => { if (settled.current) { settled.current = false; return; } commit(); };

    // The buttons and chips are one tab stop and the arrow keys move between them (roving tabindex); the title is a field of its own.
    const controls = () => Array.from(root.current?.querySelectorAll<HTMLElement>('[data-roving]:not(:disabled)') ?? []);
    const roveKeys = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target instanceof HTMLInputElement) return;
        const all = controls();
        const at = all.indexOf(event.target as HTMLElement);
        if (at < 0) return;
        const to = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? at + 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? at - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? all.length - 1 : undefined;
        if (to === undefined || event.altKey) return;
        event.preventDefault();
        const next = all[(to + all.length) % all.length];
        setRovingIndex(Number(next.dataset.roving));
        next.focus();
    };

    const toolbarProps = {
        ref: root,
        role: 'toolbar',
        'aria-label': strings.toolbarLabel(item.label),
        className: 'studio-design-toolbar',
        'data-side': placed.side,
        'data-compact': compact ? 'true' : undefined,
        'data-kind': subject.source.kind,
        style: { left: placed.left, top: placed.top },
        onKeyDown: roveKeys,
    };

    if (item.readOnly) {
        const reason = item.origin ? strings.inheritedFrom(item.origin) : strings.readOnlyReasons[item.readOnlyReason ?? ''] ?? item.readOnlyReason ?? '';
        return (
            <div {...toolbarProps} data-read-only='true'>
                <span className='studio-design-toolbar__reason'><LuLock aria-hidden='true' /><span>{reason}</span></span>
                {readOnlyActions.map((action, index) => (
                    <button key={action.id} type='button' className='studio-design-toolbar__text-action' data-action={action.id} data-roving={index} tabIndex={rovingIndex === index ? 0 : -1} onClick={() => onReadOnlyAction(action)}>{action.label}</button>
                ))}
            </div>
        );
    }

    let rove = 0;
    const roving = () => { const index = rove++; return { 'data-roving': index, tabIndex: rovingIndex === index ? 0 : -1 }; };

    const chips = actions.filter(action => chipActions.includes(action.id) && actionStateOf(action, item).visible);
    const buttons = buttonActions.flatMap(id => actions.filter(action => action.id === id)).filter(action => actionStateOf(action, item).visible);

    return (
        <div {...toolbarProps}>
            {rename?.visible && (
                <input
                    ref={title} type='text' className='studio-design-toolbar__title' value={draft} aria-label={strings.titleField} data-action='rename'
                    onChange={event => setDraft(event.target.value)} onBlur={leaveTitle} onKeyDown={titleKeys} onFocus={event => event.currentTarget.select()} />
            )}
            {rename?.visible && hasChip && <span className='studio-design-toolbar__divider' aria-hidden='true' />}
            {chips.length > 0 && (
                <div className='studio-design-toolbar__chips'>
                    {chips.map(action => (
                        <button
                            key={action.id} type='button' className='studio-design-toolbar__chip' data-action={action.id} title={action.title}
                            data-unlinked={action.id !== designModeActions.emphasis && item.unlinked && action.id !== designModeActions.slot ? 'true' : undefined}
                            aria-haspopup='dialog' {...roving()} onClick={event => onChoice(action.id, event.currentTarget)}>
                            {chipIcon[action.id]}<span>{chipLabel(action.id, item)}</span>
                        </button>
                    ))}
                </div>
            )}
            {chips.length > 0 && buttons.length > 0 && <span className='studio-design-toolbar__divider' aria-hidden='true' />}
            {buttons.length > 0 && (
                <div className='studio-design-toolbar__actions'>
                    {buttons.map(action => {
                        const state = actionStateOf(action, item);
                        return (
                            <button key={action.id} type='button' className='studio-design-toolbar__button' data-action={action.id} title={action.title} aria-label={action.title} disabled={!state.enabled} {...roving()} onClick={() => onAction(action.id)}>
                                {buttonIcon[action.id]}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
