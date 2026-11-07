// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { SlotRole } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../renderer/ComponentRegistry';
import { SceneElementView } from '../SceneElementView';
import { useOptionalSceneRouter } from '../routing/SceneRouterContext';
import { routedSlotPath } from '../routing/routedSlotPath';
import { SceneSlotRouteContext } from '../routing/SceneSlotRouteContext';
import { SceneNavigationContextInternal } from './SceneNavigationContext';
import { useSceneSlots } from './SceneSlotContext';

const roles = new Set<string>(Object.values(SlotRole));

/** How a `core:slot` element describes its slot: the same `role`, `routed`, `routedBy` and `optional` a {@link Slot} has. */
export interface CoreSlotShape {
    name: string;
    role?: SlotRole;
    routed: boolean;
    routedBy: string[];
    optional: boolean;
    closable: boolean;
}

/**
 * Reads the slot a `core:slot` element describes from its properties.
 * @param properties The element's properties.
 * @returns The slot.
 */
export function coreSlotShape(properties: Record<string, unknown>): CoreSlotShape {
    const role = typeof properties.role === 'string' && roles.has(properties.role) ? properties.role as SlotRole : undefined;
    const routedBy = Array.isArray(properties.routedBy) ? properties.routedBy.filter((name): name is string => typeof name === 'string') : [];
    return {
        name: typeof properties.name === 'string' ? properties.name : '',
        role,
        routed: properties.routed === true || routedBy.length > 0,
        routedBy,
        optional: properties.optional === true,
        closable: properties.closable === true,
    };
}

/**
 * A slot a screen or template declares: `core:slot` with a `name`, and optionally the slot's `role`, `routed`,
 * `routedBy` and `optional`.
 *
 * - It renders the screen placed in it - which may declare slots of its own, so composition nests to any depth.
 * - A routed slot shows what the router says it shows (`SceneRouter.state.slots`), so a row click that fills the detail
 *   pane, or an action that opens in it, changes the URL in a routed host. Its route - parameter values and segment - is
 *   on the node as `data-scene-slot-route`.
 * - Otherwise it shows the screen the navigation host placed in it.
 * - A `panel` is drawn as a landmark docked beside the content (`aside`), not routed; a `pane` and a `page` as regions.
 * - An `optional` slot is hidden until something fills it.
 * - A `closable` slot, and an optional pane or panel, carries a `Close` button that empties it.
 */
export function CoreSlot({ element }: RegisteredComponentProps) {
    const shape = coreSlotShape(element.properties);
    const navigation = useContext(SceneNavigationContextInternal);
    const router = useOptionalSceneRouter();
    const slots = useSceneSlots();
    const route = shape.routed ? router?.state.slots[shape.name] : undefined;
    const placed = route?.screen ?? navigation?.slots[shape.name];
    const screen = placed && slots ? slots.screens[placed] : undefined;
    if (shape.optional && !placed) return null;

    const closable = shape.closable || (shape.optional && (shape.role === SlotRole.Pane || shape.role === SlotRole.Panel));
    const close = () => (route ? router?.closeSlot(shape.name) : navigation?.closeSlot(shape.name));
    const view = (shown: NonNullable<typeof screen>, registry: NonNullable<typeof slots>['registry']) =>
        <SceneElementView element={shown} registry={registry} dataContext={navigation?.bindingScope.dataContext} queryResults={navigation?.bindingScope.queryResults} />;
    const attributes = {
        'data-scene-slot': shape.name,
        'data-scene-slot-screen': placed,
        'data-scene-slot-role': shape.role,
        'data-scene-slot-routed': shape.routed ? 'true' : undefined,
        'data-scene-slot-route': route ? routedSlotPath(route, shape.routedBy) : undefined,
        className: `scene-slot scene-slot-${shape.role ?? 'region'}`,
    };
    const content = <>
        {closable && placed && <div className='scene-slot-bar'>
            <button type='button' className='scene-slot-close' aria-label='Close' onClick={close}>Close</button>
        </div>}
        {screen && slots && (route
            ? <SceneSlotRouteContext.Provider value={route.parameters}>{view(screen, slots.registry)}</SceneSlotRouteContext.Provider>
            : view(screen, slots.registry))}
    </>;

    return shape.role === SlotRole.Panel
        ? <aside aria-label={shape.name} {...attributes}>{content}</aside>
        : <div {...attributes}>{content}</div>;
}
