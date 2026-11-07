// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a routed slot shows: the screen opened in it, the values of the route parameters it is routed by, and the segment
 * the screen adds after them - a slice's segment such as `set-product-price`, or the id of the tab chosen in it.
 */
export interface SlotRoute {
    /** The screen the slot shows; absent when only its route values are known, such as a deep link not yet resolved. */
    screen?: string;

    /** The values of the slot's route parameters, by name, such as `{ sku: 'NK-101' }`. */
    parameters: Record<string, string>;

    /** What follows the parameters in the URL, such as `set-product-price`; absent when nothing does. */
    segment?: string;
}

/**
 * The state of a page that a URL can carry: what each routed slot shows, the tab chosen in each outlet of tabs, and the
 * values the filters wrote to query parameters. A renderer reads it; the host decides how it maps to a URL.
 */
export interface SceneRouteState {
    /** What each routed slot shows, by slot name. A slot that is not listed shows nothing. */
    slots: Record<string, SlotRoute>;

    /** The id of the tab chosen in each outlet of tabs, by outlet name. An outlet that is not listed shows its first tab. */
    tabs: Record<string, string>;

    /** The values filters wrote, by query parameter name, such as `{ q: 'kettle', status: 'onSale' }`. */
    query: Record<string, string>;
}

/**
 * The routing seam of `@cratis/scene.react`: Scene does not own a router. The renderer reads the route state and asks the
 * router to change it; the host maps both to its own router and URL. Stage implements this over its router so a routed
 * slot, a chosen tab and a filter value survive refresh and travel in a shared link; the default
 * ({@link useMemorySceneRouter}) keeps them in memory for previews and specifications.
 *
 * The helpers `routedSlotPath`, `parseRoutedSlotPath`, `sceneRouteQueryString` and `parseSceneRouteQuery` turn the state
 * into URL parts and back, so a host does not invent its own encoding.
 */
export interface SceneRouter {
    /** The current route state. */
    readonly state: SceneRouteState;

    /**
     * Opens a screen in a routed slot - a row click that fills the detail pane, an action that opens in a slot.
     * @param slot The name of the slot.
     * @param route What the slot shows.
     */
    openInSlot(slot: string, route: SlotRoute): void;

    /**
     * Empties a routed slot.
     * @param slot The name of the slot.
     */
    closeSlot(slot: string): void;

    /**
     * Chooses a tab of an outlet of tabs.
     * @param outlet The name of the outlet of tabs.
     * @param tab The id of the tab.
     */
    selectTab(outlet: string, tab: string): void;

    /**
     * Writes the value of a query parameter, as a filter does.
     * @param name The name of the query parameter.
     * @param value The value; undefined or empty removes it.
     */
    setQueryParameter(name: string, value: string | undefined): void;
}

/** A route state with nothing in it. */
export const emptySceneRouteState: SceneRouteState = { slots: {}, tabs: {}, query: {} };
