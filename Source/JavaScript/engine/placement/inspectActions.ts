// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletAction, OutletItem, OutletItemKind, OutletSubject, Opens, SceneElement } from '@cratis/scene.model';
import { EffectiveOutlet } from '../outlets/EffectiveOutlet';
import { OutletProvenance } from '../outlets/OutletProvenance';
import { ActionInspection, ActionInspectionContext, ActionSlice } from './ActionInspection';
import { InputSourceKind } from './InputSourceKind';
import { PlacementInput } from './PlacementInput';
import { resolveEnablement } from './resolveEnablement';
import { resolvePlacement } from './resolvePlacement';

/**
 * Where an `action` component's argument source gets its value: `component.<id>.<output>` is another component's output,
 * `route.<parameter>` a route value, and any other path the data context. An empty source is no source.
 * @param source The argument's source as stored on the element.
 * @returns Where it gets its value, or undefined when it has none.
 */
export function argumentSourceKind(source: unknown): InputSourceKind | undefined {
    if (typeof source !== 'string' || source.trim().length === 0) return undefined;
    if (source.startsWith('component.')) return InputSourceKind.Component;
    if (source.startsWith('route.')) return InputSourceKind.Route;
    return InputSourceKind.DataContext;
}

interface ActionShape {
    id: string;
    title: string;
    slice?: ActionSlice;
    opens?: Opens;
    opensIn?: string;
    subject?: OutletSubject;
    enabledWhen?: string;
    authorize?: string;
    inputs?: PlacementInput[];
}

function inspectAction(action: ActionShape, context: ActionInspectionContext): Omit<ActionInspection, 'provenance' | 'editable' | 'group'> {
    const slice = action.slice;
    const placement = slice === undefined ? undefined : resolvePlacement({
        slice: slice.id,
        opens: action.opens,
        opensIn: action.opensIn,
        screen: slice.screen,
        fits: slice.fits,
        inputs: action.inputs ?? slice.inputs,
        slots: context.slots,
        routeValues: context.routeValues,
    });
    const enablement = resolveEnablement({
        subject: action.subject,
        selected: context.selected,
        item: context.item,
        authorize: action.authorize ?? slice?.authorize,
        persona: context.persona,
        enabledWhen: action.enabledWhen,
        conditionHolds: context.conditions?.[action.id],
    });
    const result: Omit<ActionInspection, 'provenance' | 'editable' | 'group'> = { id: action.id, title: action.title, enablement };
    if (slice !== undefined) result.slice = slice.id;
    if (placement !== undefined) result.placement = placement;
    return result;
}

function sliceOf(context: ActionInspectionContext, slice: string | undefined, command: string | undefined): ActionSlice | undefined {
    if (slice !== undefined) return context.slices.find(candidate => candidate.id === slice);
    if (command !== undefined) return context.slices.find(candidate => candidate.command === command);
    return undefined;
}

function isAction(item: OutletItem): item is OutletItem & OutletAction {
    return item.kind === OutletItemKind.Button || item.kind === OutletItemKind.MenuEntry;
}

/**
 * Inspects every action of a resolved outlet of actions - its buttons and menu entries, and those inside its groups - for
 * an editor: where each comes from in the outlet's chain, where its slice opens and whether it can be used, each with the
 * reason. The C# engine answers the same (`ActionInspector.InspectOutlet`).
 *
 * An action's subject is its own, or the outlet's; its authorization is its own, or that of the command its slice submits.
 * @param outlet The resolved outlet.
 * @param context The slices the actions run, the page's slots and the state to check enablement against.
 * @returns One inspection per action, in the outlet's order.
 */
export function inspectOutletActions(outlet: EffectiveOutlet, context: ActionInspectionContext): ActionInspection[] {
    const result: ActionInspection[] = [];
    const add = (item: OutletItem, provenance: OutletProvenance, editable: boolean, group?: string) => {
        if (!isAction(item)) return;
        const inspection = inspectAction({
            id: item.id,
            title: item.title,
            slice: sliceOf(context, item.slice, item.command),
            opens: item.opens,
            opensIn: item.opensIn,
            subject: item.subject ?? outlet.subject,
            enabledWhen: item.enabledWhen,
            authorize: item.authorize,
        }, context);
        result.push({ ...inspection, ...(group === undefined ? {} : { group }), provenance, editable });
    };

    for (const entry of outlet.items) {
        if (entry.item.kind === OutletItemKind.Group) {
            for (const child of entry.item.items) add(child, entry.provenance, entry.editable, entry.item.id);
            continue;
        }
        add(entry.item, entry.provenance, entry.editable);
    }
    return result;
}

function text(properties: Record<string, unknown>, name: string): string | undefined {
    const value = properties[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Inspects an `action` component for an editor, through the same model as an outlet's actions: where its slice opens
 * and whether it can be used, each with the reason. Its command names the slice (by the command it submits, or by the
 * slice's id), and its argument mapping gives each input its source, falling back to the slice's own.
 * The C# engine answers the same (`ActionInspector.InspectElement`).
 * @param element The `action` component.
 * @param context The slices, the page's slots and the state to check enablement against.
 * @returns The inspection.
 */
export function inspectActionElement(element: SceneElement, context: ActionInspectionContext): ActionInspection {
    const properties = (element.properties ?? {}) as Record<string, unknown>;
    const command = text(properties, 'command');
    const slice = command === undefined ? undefined : context.slices.find(candidate => candidate.command === command || candidate.id === command);
    const mapping = new Map<string, unknown>();
    for (const argument of Array.isArray(properties.arguments) ? properties.arguments : []) {
        if (typeof argument === 'object' && argument !== null && typeof (argument as { name?: unknown }).name === 'string' && !mapping.has((argument as { name: string }).name)) {
            mapping.set((argument as { name: string }).name, (argument as { source?: unknown }).source);
        }
    }
    const inputs = slice?.inputs.map(input => {
        const source = mapping.has(input.name) ? argumentSourceKind(mapping.get(input.name)) : input.source;
        return source === undefined ? { name: input.name } : { name: input.name, source };
    });

    return inspectAction({
        id: element.id,
        title: text(properties, 'label') ?? command ?? element.id,
        slice,
        opens: text(properties, 'opens') as Opens | undefined,
        opensIn: text(properties, 'opensIn'),
        subject: text(properties, 'subject') as OutletSubject | undefined,
        enabledWhen: text(properties, 'enabledWhen'),
        authorize: text(properties, 'authorize'),
        inputs,
    }, context);
}
