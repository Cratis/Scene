// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PlacementDecision } from '@cratis/scene.engine';
import { SlotRoute } from './SceneRouter';

/**
 * The part of a URL a routed slot adds: the values of its route parameters in the order the slot is routed by, then the
 * segment of what it shows - `NK-101/set-product-price`. A parameter without a value is left out.
 * @param route What the slot shows.
 * @param routedBy The route parameters the slot is routed by, in order.
 * @returns The path, without a leading or trailing slash; empty when the route adds nothing.
 */
export function routedSlotPath(route: SlotRoute, routedBy: readonly string[]): string {
    const parts = routedBy
        .map(name => route.parameters[name])
        .filter((value): value is string => value !== undefined && value !== '')
        .map(encodeURIComponent);
    if (route.segment) parts.push(...route.segment.split('/').map(encodeURIComponent));
    return parts.join('/');
}

/**
 * Reads what a routed slot shows back from the part of a URL {@link routedSlotPath} wrote.
 * @param path The path, with or without slashes around it.
 * @param routedBy The route parameters the slot is routed by, in order.
 * @returns The route: a value per parameter, and whatever follows them as the segment.
 */
export function parseRoutedSlotPath(path: string, routedBy: readonly string[]): SlotRoute {
    const parts = path.split('/').filter(part => part.length > 0).map(decodeURIComponent);
    const parameters: Record<string, string> = {};
    routedBy.forEach((name, index) => {
        if (index < parts.length) parameters[name] = parts[index];
    });
    const rest = parts.slice(routedBy.length);
    return rest.length > 0 ? { parameters, segment: rest.join('/') } : { parameters };
}

/**
 * What a placement decision that opens in a routed slot puts in that slot: the page's values for the slot's route
 * parameters and the slice's segment.
 * @param decision The placement decision.
 * @param screen The screen the slot shows.
 * @returns The route, or undefined when the decision does not open in a routed slot.
 */
export function slotRouteFromPlacement(decision: PlacementDecision, screen?: string): SlotRoute | undefined {
    if (!decision.route) return undefined;
    const parameters: Record<string, string> = {};
    for (const parameter of decision.route.parameters) {
        if (parameter.value !== undefined) parameters[parameter.name] = parameter.value;
    }
    const route: SlotRoute = { parameters, segment: decision.route.segment };
    if (screen !== undefined) route.screen = screen;
    return route;
}

/**
 * The query string the filters' values make, such as `?q=kettle&status=onSale`.
 * @param query The values, by query parameter name.
 * @returns The query string with its `?`, or empty when there are no values.
 */
export function sceneRouteQueryString(query: Record<string, string>): string {
    const pairs = Object.entries(query)
        .filter(([, value]) => value !== '')
        .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

/**
 * Reads the filters' values back from a query string {@link sceneRouteQueryString} wrote.
 * @param search The query string, with or without its `?`.
 * @returns The values, by query parameter name.
 */
export function parseSceneRouteQuery(search: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [name, value] of new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)) {
        if (value !== '') result[name] = value;
    }
    return result;
}
