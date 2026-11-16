// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import { LuPlus } from 'react-icons/lu';
import type { InspectedProperty } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import { createBindingScope } from '../Binding/bindingScopeTypes';
import { createEditorContext } from '../PropertyEditors/Registry/createEditorContext';
import type { EditorContext } from '../PropertyEditors/Registry/PropertyEditorProps';
import { screenEditorPropertyEditors } from '../PropertyEditors/Registry/screenEditorPropertyEditors';
import { slotNames } from '../Inspector/NavigationSection';
import { addOfferOf } from './designModeFeedback';
import { isRejection, designModeActions, type DesignModeItem } from './designModeTypes';
import type { DesignModeStrings } from './DesignModeStrings';
import { DesignModePopover } from './DesignModePopover';
import { FloatingItemToolbar } from './FloatingItemToolbar';
import type { DesignModeState } from './useDesignMode';
import { useDesignModeMeasurement } from './useDesignModeMeasurement';
import { inSurfacePixels, surfaceOrigin } from '../Surface/elementRect';
import './DesignModeChrome.css';
import './DesignModeNavigation.css';

// What the editors of a choice are lent: the session that is being edited, or - where the outlets of a level are edited in place on a template and no session is
// open - the context the host builds from what it has.
export type DesignModeEditorSource =
    | { controller: ScreenEditorController; editorStrings: ScreenEditorStrings }
    | { editorContext: () => EditorContext };

export type DesignModeChromeProps = {
    surface: RefObject<HTMLDivElement | null>;
    state: DesignModeState;
    environment: ScreenEditorEnvironment;
    strings: DesignModeStrings;
} & DesignModeEditorSource;

const addSize = 34;

interface OpenChoice {
    actionId: string;
    itemId: string;
    opener: HTMLElement;
}

// What the editor draws over the selected design-mode component and nothing else (DM1): the "+" that adds an item after the last one, the floating
// toolbar of the selected item and the popover of a choice. It is chrome - drawn over the rendered screen, never part of it - so none of it exists
// in preview or in Stage, which render the screen alone.
export const DesignModeChrome = (props: DesignModeChromeProps) => {
    const { surface, state, environment, strings } = props;
    const { subject } = state;
    const measurement = useDesignModeMeasurement(surface, subject);
    const [choice, setChoice] = useState<OpenChoice>();
    const registry = environment.propertyEditors?.registry ?? screenEditorPropertyEditors;
    const bindingScope = useMemo(() => createBindingScope(environment.availableSources), [environment.availableSources]);

    const sliceName = useCallback((id: unknown): string | undefined => {
        if (typeof id !== 'string' || id === '') return undefined;
        const known = environment.propertyEditors?.slices?.find(slice => slice.id === id) ?? environment.stateChangeSlices.find(slice => slice.id === id);
        const segments = id.split('.');
        return known?.name ?? segments[segments.length - 1];
    }, [environment]);

    const chipLabel = useCallback((actionId: string, item: DesignModeItem): string => {
        const given = item.chips?.[actionId];
        if (given !== undefined && given !== '') return given;
        switch (actionId) {
            case designModeActions.slice: return sliceName(item.values.slice) ?? strings.chooseSlice;
            case designModeActions.emphasis: return strings.emphasis[String(item.values.emphasis ?? 'secondary').toLowerCase()] ?? String(item.values.emphasis ?? '');
            case designModeActions.slot: return typeof item.values.slot === 'string' && item.values.slot !== '' ? item.values.slot : strings.mainArea;
            default: return strings.notLinked;
        }
    }, [sliceName, strings]);

    // A sub-item that is selected must be seen: its parent is opened when the region has it collapsed (NAV10).
    const hidden = subject?.selected?.parentId !== undefined && measurement !== undefined && measurement.items[subject.selected.id] === undefined;
    const parentId = subject?.selected?.parentId;
    useEffect(() => {
        if (!hidden || !parentId) return;
        // The region opens a collapsed parent on ArrowRight from its link - the way a person would - which keeps the press out of the surface's selection.
        const link = surface.current?.querySelector<HTMLElement>(`[data-scene-nav-item="${CSS.escape(parentId)}"] > [data-scene-nav-link]`);
        if (!link) return;
        link.focus({ preventScroll: true });
        link.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    }, [hidden, parentId, surface]);

    if (!subject || !measurement) return null;
    const { selected, source } = subject;
    const hasAdd = subject.mode.addActions[0];

    // The "+" goes after the last item: to the right of it in a row, below it in a column. A column is a component whose items stack - a sidebar.
    const itemRects = source.items.flatMap(item => measurement.items[item.id] ? [measurement.items[item.id]] : []);
    const last = itemRects[itemRects.length - 1];
    const vertical = subject.mode.itemToolbar.some(action => action.compact === true);
    const base = last ?? measurement.component;
    const add = base && hasAdd
        ? (vertical || !last
            ? { left: (last ?? base).left, top: (last ? last.top + last.height : base.top) + 8 }
            : { left: last.left + last.width + 8, top: last.top + (last.height - addSize) / 2 })
        : undefined;

    const offer = addOfferOf(hasAdd?.label ?? '', state.readOnlyReason);
    const anchor = selected ? measurement.items[selected.id] : undefined;
    const open = choice && selected && choice.itemId === selected.id ? source.choice(choice.actionId, selected) : undefined;
    const close = () => setChoice(undefined);

    const popoverContext = () => 'editorContext' in props ? props.editorContext() : createEditorContext({
        controller: props.controller, environment, strings: props.editorStrings, ownership: undefined, diagnostics: [], inCanvas: false, bindingScope, slotNames: slotNames(strings.navigation),
    });

    // What the editor reports is the same edit whichever place it is drawn in: the source turns the value into it.
    const chosen = (_property: InspectedProperty, value: unknown) => {
        if (!open) return;
        const outcome = open.plan(value);
        if (!isRejection(outcome)) setChoice(undefined);
        state.perform(outcome);
    };

    const toolbarAnchor = anchor;
    return (
        <>
            {add && hasAdd && (
                <button
                    type='button' className='studio-design-add' data-action={hasAdd.id} aria-label={hasAdd.label} title={offer.title}
                    disabled={offer.disabled}
                    style={{ left: add.left, top: add.top, width: addSize, height: addSize }}
                    onClick={() => state.add(hasAdd.id)}>
                    <LuPlus aria-hidden='true' />
                </button>
            )}
            {selected && toolbarAnchor && (
                <FloatingItemToolbar
                    key={selected.id}
                    subject={subject} item={selected} anchor={toolbarAnchor} bounds={measurement.surface} strings={strings}
                    renameToken={state.renameToken} chipLabel={chipLabel}
                    onRename={label => state.rename(selected, label)}
                    onAction={actionId => state.act(actionId, selected)}
                    onChoice={(actionId, chip) => setChoice(current => current && current.actionId === actionId && current.itemId === selected.id ? undefined : { actionId, itemId: selected.id, opener: chip })}
                    readOnlyActions={source.readOnlyActions(selected)}
                    onReadOnlyAction={action => state.perform(action.plan())}
                    onLeave={() => surface.current?.focus({ preventScroll: true })} />
            )}
            {open && choice && toolbarAnchor && (
                <DesignModePopover
                    registry={registry} property={open.property} context={popoverContext()} componentId={selected!.id}
                    anchor={relativeTo(surface, choice.opener)} opener={choice.opener} bounds={measurement.surface}
                    title={subject.mode.itemToolbar.find(action => action.id === choice.actionId)?.title ?? choice.actionId}
                    strings={strings} onChange={chosen} onClose={close} />
            )}
            {selected && anchor && subject.source.kind === 'region' && (
                <div className='studio-design-item-ring' data-item={selected.id} style={{ left: anchor.left - 2, top: anchor.top - 2, width: anchor.width + 4, height: anchor.height + 4 }} />
            )}
            {state.notice !== '' && <div className='studio-design-toast' role='status'>{state.notice}</div>}
            <span className='studio-design-announcement' role='status' aria-live='polite'>{state.announcement}</span>
        </>
    );
};

// Where an element is on the surface, in the surface's pixels.
function relativeTo(surface: RefObject<HTMLDivElement | null>, element: HTMLElement) {
    const box = element.getBoundingClientRect();
    return surface.current ? inSurfacePixels(box, surfaceOrigin(surface.current)) : { left: box.left, top: box.top, width: box.width, height: box.height };
}
