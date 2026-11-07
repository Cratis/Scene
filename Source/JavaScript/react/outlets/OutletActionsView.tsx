// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { ActionInspection, EffectiveOutlet, EnablementState, inspectOutletActions } from '@cratis/scene.engine';
import { OutletAction, OutletButton, OutletGroup, OutletItem, OutletItemKind, ToolbarEmphasis } from '@cratis/scene.model';
import { useSceneOutlets } from './SceneOutletsContext';
import { usePageRouteValues } from './usePageRouteValues';
import { isEmptyOutletAction, outletActionOpensOverPage, useOutletActionActivation } from './useOutletActionActivation';
import { useSceneNavigationModel } from '../navigation/region/SceneNavigationModelContext';
import { useWarnEmptySlices } from '../slices/SliceInvokerContext';

export interface OutletActionsViewProps {
    /** The resolved outlet of actions. */
    outlet: EffectiveOutlet;

    /** The item the actions act on - the selected row - when there is one. */
    item?: unknown;

    /** The id of the element that draws the outlet. */
    elementId?: string;
}

/** Whether an action can be used, as the renderer draws it: hidden, or disabled with the reason as its tooltip. */
export interface OutletActionState {
    hidden: boolean;
    disabled: boolean;
    reason?: string;
}

/**
 * How an action is drawn, from what inspection worked out: hidden when the persona cannot issue its command, disabled with
 * the enablement reason when a check holds it back, and disabled with the placement reason when its slice cannot open where
 * it asks.
 * @param inspection The inspection of the action.
 * @returns How it is drawn.
 */
export function outletActionState(inspection: ActionInspection | undefined): OutletActionState {
    if (!inspection) return { hidden: false, disabled: false };
    if (inspection.enablement.state === EnablementState.Hidden) return { hidden: true, disabled: true, reason: inspection.enablement.reason };
    if (inspection.enablement.state === EnablementState.Disabled) return { hidden: false, disabled: true, reason: inspection.enablement.reason };
    if (inspection.placement && inspection.placement.resolved === undefined) return { hidden: false, disabled: true, reason: inspection.placement.reason };
    return { hidden: false, disabled: false };
}

function isAction(item: OutletItem): item is OutletItem & OutletAction {
    return item.kind === OutletItemKind.Button || item.kind === OutletItemKind.MenuEntry;
}

interface ActionControlProps {
    action: OutletAction;
    inspection?: ActionInspection;
    role?: 'menuitem';
    item?: unknown;
    routeValues: Record<string, string>;
    elementId?: string;
    onActivated?(): void;
}

function ActionControl({ action, inspection, role, item, routeValues, elementId, onActivated }: ActionControlProps) {
    const activate = useOutletActionActivation();
    const model = useSceneNavigationModel();
    const warnEmptySlices = useWarnEmptySlices();
    const [asking, setAsking] = useState(false);
    const state = outletActionState(inspection);
    if (state.hidden) return null;
    const empty = warnEmptySlices && isEmptyOutletAction(action);
    const popup = outletActionOpensOverPage(action, inspection, model);

    const emphasis = action.kind === OutletItemKind.Button ? (action as OutletButton).emphasis ?? ToolbarEmphasis.Secondary : undefined;
    const run = () => {
        activate({ action, inspection, item, routeValues, elementId });
        onActivated?.();
    };

    return <>
        <button
            type='button'
            role={role}
            data-scene-outlet-item={action.id}
            data-scene-item-kind={action.kind}
            data-scene-emphasis={emphasis}
            data-scene-slice={inspection?.slice ?? action.slice}
            data-scene-opens={inspection?.placement?.resolved}
            data-scene-enablement={inspection?.enablement.state}
            data-scene-warning={empty ? 'emptySlice' : undefined}
            aria-haspopup={popup ? 'dialog' : undefined}
            className={role === 'menuitem' ? 'scene-outlet-menu-item' : `scene-toolbar-button scene-toolbar-button-${emphasis ?? 'secondary'}`}
            disabled={state.disabled}
            title={state.reason}
            aria-description={state.reason}
            onClick={() => (action.confirm ? setAsking(true) : run())}
        >
            {action.icon && <span aria-hidden='true' data-scene-icon-name={action.icon} />}
            {action.title}
            {empty && <span role='img' aria-label='No slice is linked to this button' title='No slice is linked to this button' data-scene-badge='warning'>!</span>}
        </button>
        {asking && (
            <div role='alertdialog' aria-modal='true' aria-label={action.title} aria-describedby={`${action.id}-confirm`} data-scene-confirm={action.id} className='scene-toolbar-confirm'
                onKeyDown={event => { if (event.key === 'Escape') setAsking(false); }}>
                <div className='scene-toolbar-confirm-card'>
                    <p id={`${action.id}-confirm`} className='scene-toolbar-confirm-text'>{action.confirm}</p>
                    <div className='scene-toolbar-confirm-actions'>
                        <button type='button' data-scene-confirm-cancel className='scene-toolbar-button scene-toolbar-button-quiet' onClick={() => setAsking(false)}>Cancel</button>
                        <button type='button' data-scene-confirm-accept autoFocus className='scene-toolbar-button scene-toolbar-button-primary' onClick={() => { setAsking(false); run(); }}>{action.title}</button>
                    </div>
                </div>
            </div>
        )}
    </>;
}

interface MenuProps {
    id: string;
    title: string;
    icon?: string;
    items: OutletItem[];
    inspections: Map<string, ActionInspection>;
    item?: unknown;
    routeValues: Record<string, string>;
    elementId?: string;
}

function MenuEntries({ items, inspections, item, routeValues, elementId, onActivated }: Omit<MenuProps, 'id' | 'title' | 'icon'> & { onActivated(): void }) {
    return <>{items.map(entry => {
        if (entry.kind === OutletItemKind.Separator) return <div key={entry.id} role='separator' data-scene-outlet-item={entry.id} className='scene-outlet-separator' />;
        if (entry.kind === OutletItemKind.Group) {
            const group = entry as OutletGroup;
            return <div key={group.id} role='group' aria-label={group.title} data-scene-outlet-item={group.id} className='scene-outlet-menu-group'>
                <MenuEntries items={group.items} inspections={inspections} item={item} routeValues={routeValues} elementId={elementId} onActivated={onActivated} />
            </div>;
        }
        if (!isAction(entry)) return null;
        return <ActionControl key={entry.id} role='menuitem' action={entry} inspection={inspections.get(entry.id)} item={item} routeValues={routeValues} elementId={elementId} onActivated={onActivated} />;
    })}</>;
}

function Menu({ id, title, icon, items, inspections, item, routeValues, elementId }: MenuProps) {
    const [open, setOpen] = useState(false);
    const visible = items.filter(entry => !isAction(entry) || !outletActionState(inspections.get(entry.id)).hidden);
    if (!visible.some(entry => entry.kind !== OutletItemKind.Separator)) return null;

    return <div className='scene-outlet-menu' data-scene-outlet-item={id} data-scene-item-kind={OutletItemKind.Group}
        onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
        <button type='button' className='scene-toolbar-button scene-toolbar-button-secondary' aria-haspopup='menu' aria-expanded={open} onClick={() => setOpen(!open)}>
            {icon && <span aria-hidden='true' data-scene-icon-name={icon} />}
            {title}
        </button>
        {open && <div role='menu' aria-label={title} className='scene-outlet-menu-list'>
            <MenuEntries items={visible} inspections={inspections} item={item} routeValues={routeValues} elementId={elementId} onActivated={() => setOpen(false)} />
        </div>}
    </div>;
}

/** The title of the menu the menu entries of an outlet of actions that sit outside any group are gathered in. */
export const moreActionsTitle = 'More';

/**
 * Draws an outlet of actions as a toolbar: its buttons in order, separators between them, a group as a menu, and the menu
 * entries that sit outside any group in a trailing `More` menu. Each action is hidden, disabled with the reason as its
 * tooltip, or enabled, as the engine's inspection says (`inspectOutletActions`), and opens where placement decided.
 */
export function OutletActionsView({ outlet, item, elementId }: OutletActionsViewProps) {
    const context = useSceneOutlets();
    const routeValues = usePageRouteValues();
    const selected = item !== undefined && item !== null;
    const inspections = useMemo(() => new Map(inspectOutletActions(outlet, {
        slices: context?.slices ?? [],
        slots: context?.slots ?? [],
        routeValues,
        selected,
        item,
        persona: context?.persona,
        conditions: context?.conditions,
    }).map(inspection => [inspection.id, inspection])), [context, item, outlet, routeValues, selected]);

    const entries = outlet.items.map(entry => entry.item);
    const loose = entries.filter(entry => entry.kind === OutletItemKind.MenuEntry);

    return <div role='toolbar' aria-label={outlet.name} data-scene-outlet={outlet.name} data-scene-outlet-kind={outlet.kind} data-scene-id={elementId} className='scene-outlet scene-outlet-actions'>
        {entries.map(entry => {
            if (entry.kind === OutletItemKind.Separator) return <span key={entry.id} role='separator' aria-orientation='vertical' data-scene-outlet-item={entry.id} className='scene-outlet-separator' />;
            if (entry.kind === OutletItemKind.Group) {
                const group = entry as OutletGroup;
                return <Menu key={group.id} id={group.id} title={group.title} icon={group.icon} items={group.items} inspections={inspections} item={item} routeValues={routeValues} elementId={elementId} />;
            }
            if (entry.kind !== OutletItemKind.Button) return null;
            return <ActionControl key={entry.id} action={entry as OutletButton} inspection={inspections.get(entry.id)} item={item} routeValues={routeValues} elementId={elementId} />;
        })}
        {loose.length > 0 && <Menu id={`${outlet.name}-more`} title={moreActionsTitle} items={loose} inspections={inspections} item={item} routeValues={routeValues} elementId={elementId} />}
    </div>;
}
