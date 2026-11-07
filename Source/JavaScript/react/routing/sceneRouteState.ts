// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneRouteState, SlotRoute } from './SceneRouter';

/**
 * The route state with a screen opened in a routed slot. Pure, so a host router can reuse it.
 * @param state The state.
 * @param slot The slot.
 * @param route What the slot shows.
 * @returns The new state.
 */
export function withSlotOpened(state: SceneRouteState, slot: string, route: SlotRoute): SceneRouteState {
    return { ...state, slots: { ...state.slots, [slot]: route } };
}

/**
 * The route state with a routed slot emptied.
 * @param state The state.
 * @param slot The slot.
 * @returns The new state; the same state when the slot showed nothing.
 */
export function withSlotClosed(state: SceneRouteState, slot: string): SceneRouteState {
    if (!(slot in state.slots)) return state;
    const slots = { ...state.slots };
    delete slots[slot];
    return { ...state, slots };
}

/**
 * The route state with a tab chosen.
 * @param state The state.
 * @param outlet The outlet of tabs.
 * @param tab The id of the tab.
 * @returns The new state.
 */
export function withTabSelected(state: SceneRouteState, outlet: string, tab: string): SceneRouteState {
    return { ...state, tabs: { ...state.tabs, [outlet]: tab } };
}

/**
 * The route state with a query parameter written; an undefined or empty value removes it.
 * @param state The state.
 * @param name The query parameter.
 * @param value The value.
 * @returns The new state.
 */
export function withQueryParameter(state: SceneRouteState, name: string, value: string | undefined): SceneRouteState {
    const query = { ...state.query };
    if (value === undefined || value === '') {
        delete query[name];
    } else {
        query[name] = value;
    }
    return { ...state, query };
}
