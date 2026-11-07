// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { ActionInspection, ActionSlice, ApplicationStructureIndex, InputSourceKind, defaultSliceDialogTemplate, sliceDialogFor } from '@cratis/scene.engine';
import { DestinationReference, Opens, OutletAction, OutletBuiltInAction } from '@cratis/scene.model';
import { SceneNavigationContextInternal, SceneNavigationContextValue } from '../navigation/SceneNavigationContext';
import { useSceneNavigationModel } from '../navigation/region/SceneNavigationModelContext';
import { SceneNavigationModel } from '../navigation/region/SceneNavigationModel';
import { useSceneRouter } from '../routing/SceneRouterContext';
import { slotRouteFromPlacement } from '../routing/routedSlotPath';
import { SceneRouter, SlotRoute } from '../routing/SceneRouter';
import { SliceDialogPresentation, sliceScreenDestination } from '../slices/sliceDialogDestination';
import { useSliceInvoker } from '../slices/SliceInvokerContext';
import { SliceInvoker } from '../slices/SliceInvoker';
import { SceneOutletsContextValue, useSceneOutlets } from './SceneOutletsContext';

/** The host-neutral event an outlet's built-in action (`refresh`, `submit`, `close`) is announced with. */
export const outletBuiltInEventName = 'cratis.scene.builtIn';

/** What an activated action needs to know about where it is. */
export interface OutletActionActivation {
    /** The action. */
    action: OutletAction;

    /** What inspection worked out for it: its slice, placement and enablement. */
    inspection?: ActionInspection;

    /** The item the action acts on, when it acts on one. */
    item?: unknown;

    /** The values of the page's route parameters. */
    routeValues: Record<string, string>;

    /** The id of the element the action is drawn by. */
    elementId?: string;
}

interface ActivationServices {
    navigation?: SceneNavigationContextValue;
    router: SceneRouter;
    invoker: SliceInvoker;
    outlets?: SceneOutletsContextValue;
    model?: SceneNavigationModel;
}

function sliceOf(outlets: SceneOutletsContextValue | undefined, action: OutletAction, inspection?: ActionInspection): ActionSlice | undefined {
    const slices = outlets?.slices ?? [];
    const id = inspection?.slice ?? action.slice;
    if (id !== undefined) return slices.find(slice => slice.id === id);
    if (action.command !== undefined) return slices.find(slice => slice.command === action.command);
    return undefined;
}

function indexOf(model: SceneNavigationModel | undefined): ApplicationStructureIndex | undefined {
    if (!model) return undefined;
    return model.structure instanceof ApplicationStructureIndex ? model.structure : new ApplicationStructureIndex(model.structure);
}

/**
 * The values an action that runs directly sends: each input of its command, from the item it acts on or the page's route,
 * as the slice's hooks say. An input whose source is a constant or another component is the host's to fill.
 */
export function directPayload(slice: ActionSlice | undefined, item: unknown, routeValues: Record<string, string>): Record<string, unknown> {
    const fields = item !== null && typeof item === 'object' ? item as Record<string, unknown> : {};
    if (!slice) return { ...fields };
    const payload: Record<string, unknown> = {};
    for (const input of slice.inputs) {
        if (input.source === InputSourceKind.Route && input.name in routeValues) payload[input.name] = routeValues[input.name];
        else if (input.name in fields) payload[input.name] = fields[input.name];
    }
    return payload;
}

/**
 * Fills the route parameters the page has no value for from the item the action acts on - the selected row's `sku` for a
 * detail pane routed by `sku`.
 */
function withItemParameters(route: SlotRoute, names: readonly string[], item: unknown): SlotRoute {
    if (item === null || typeof item !== 'object') return route;
    const fields = item as Record<string, unknown>;
    const parameters = { ...route.parameters };
    for (const name of names) {
        if (parameters[name] === undefined && fields[name] !== undefined && fields[name] !== null) parameters[name] = String(fields[name]);
    }
    return { ...route, parameters };
}

function navigateTo(services: ActivationServices, destination: DestinationReference, elementId?: string) {
    if (services.navigation) {
        services.navigation.navigate(destination);
        return;
    }
    globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', {
        detail: { targetScreen: destination.screen ?? '', dialog: destination.dialog, destination, element: elementId },
    }));
}

function openOverPage(services: ActivationServices, activation: OutletActionActivation, sliceId: string, presentation: SliceDialogPresentation) {
    const slice = sliceOf(services.outlets, activation.action, activation.inspection);
    const index = indexOf(services.model);
    const resolved = index ? sliceDialogFor(index, sliceId, services.outlets?.defaultDialogTemplate) : undefined;
    const dialog = resolved ?? {
        slice: sliceId,
        command: slice?.command ?? activation.action.command ?? sliceId,
        template: services.outlets?.defaultDialogTemplate ?? defaultSliceDialogTemplate,
    };
    navigateTo(services, sliceScreenDestination(dialog, activation.action.title, presentation), activation.elementId);
}

/**
 * Whether choosing an action opens something over the page - a dialog or a drawer - so the control can say it has a popup.
 * @param action The action.
 * @param inspection What inspection worked out for it.
 * @param model The application's structure, when the host has it.
 * @returns Whether it opens a dialog or a drawer.
 */
export function outletActionOpensOverPage(action: OutletAction, inspection: ActionInspection | undefined, model: SceneNavigationModel | undefined): boolean {
    if (action.runs !== undefined || action.navigateTo !== undefined) return false;
    const resolved = inspection?.placement?.resolved;
    if (resolved !== undefined) return resolved === Opens.Dialog || resolved === Opens.Drawer;
    const sliceId = inspection?.slice ?? action.slice;
    const index = indexOf(model);
    return sliceId !== undefined && index !== undefined && sliceDialogFor(index, sliceId) !== undefined;
}

/**
 * Whether an action does nothing: no slice, command, navigation target or built-in. A design or preview host flags it.
 * @param action The action.
 * @returns Whether it is empty.
 */
export function isEmptyOutletAction(action: OutletAction): boolean {
    return action.slice === undefined && action.command === undefined && action.navigateTo === undefined && action.runs === undefined;
}

function announceCommand(activation: OutletActionActivation, command: string, payload: Record<string, unknown>) {
    globalThis.dispatchEvent(new CustomEvent('cratis.scene.command', { detail: { command, element: activation.elementId, arguments: payload } }));
}

/**
 * Does what an action of an outlet does when it is chosen:
 *
 * - a built-in runs: `close` closes the dialog it sits in, and every built-in is announced with `cratis.scene.builtIn`;
 * - a navigation target is navigated to, through the navigation host or with `cratis.scene.navigate` outside one;
 * - a slice opens where placement decided: run directly (`none`) invokes it with the slice invoker, a dialog or drawer
 *   opens the slice's screen over the page, and a slot opens it there - through the router when the slot is routed, so
 *   the URL changes;
 * - a slice placement knows nothing about opens its task dialog, and a hand-authored command is announced with
 *   `cratis.scene.command`.
 * @param services What the action acts through.
 * @param activation The action and where it is.
 */
export function activateOutletAction(services: ActivationServices, activation: OutletActionActivation): void {
    const { action, inspection } = activation;
    if (action.runs !== undefined) {
        if (action.runs === OutletBuiltInAction.Close) services.navigation?.closeDialog();
        globalThis.dispatchEvent(new CustomEvent(outletBuiltInEventName, { detail: { action: action.runs, id: action.id, element: activation.elementId } }));
        return;
    }

    if (action.navigateTo !== undefined) {
        navigateTo(services, action.navigateTo, activation.elementId);
        return;
    }

    const slice = sliceOf(services.outlets, action, inspection);
    const sliceId = inspection?.slice ?? action.slice ?? slice?.id;
    const placement = inspection?.placement;
    if (sliceId !== undefined && placement?.resolved !== undefined) {
        switch (placement.resolved) {
            case Opens.None:
                void services.invoker.invoke(sliceId, directPayload(slice, activation.item, activation.routeValues), slice?.command ?? action.command);
                return;
            case Opens.Drawer:
                openOverPage(services, activation, sliceId, 'drawer');
                return;
            case Opens.Slot: {
                const name = placement.slot ?? action.opensIn ?? '';
                const route = slotRouteFromPlacement(placement, slice?.screen) ?? { screen: slice?.screen, parameters: {} };
                services.router.openInSlot(name, withItemParameters(route, placement.route?.parameters.map(parameter => parameter.name) ?? [], activation.item));
                return;
            }
            default:
                openOverPage(services, activation, sliceId, 'dialog');
                return;
        }
    }

    // A slice placement knows nothing about: the application's structure says whether it opens a task dialog; without it,
    // or for a slice that takes no input, the command is announced for the host to run.
    const index = indexOf(services.model);
    if (sliceId !== undefined && index !== undefined && sliceDialogFor(index, sliceId) !== undefined) {
        openOverPage(services, activation, sliceId, action.opens === Opens.Drawer ? 'drawer' : 'dialog');
        return;
    }

    const command = action.command ?? sliceId;
    if (command !== undefined) announceCommand(activation, command, directPayload(slice, activation.item, activation.routeValues));
}

/**
 * The function that activates an action of an outlet, bound to the navigation host, router, slice invoker and page around
 * the component.
 * @returns The activation function.
 */
export function useOutletActionActivation(): (activation: OutletActionActivation) => void {
    const navigation = useContext(SceneNavigationContextInternal);
    const router = useSceneRouter();
    const invoker = useSliceInvoker();
    const outlets = useSceneOutlets();
    const model = useSceneNavigationModel();
    return activation => activateOutletAction({ navigation, router, invoker, outlets, model }, activation);
}
