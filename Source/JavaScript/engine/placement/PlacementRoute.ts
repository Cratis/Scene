// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One route parameter a routed slot is addressed by, with the page's value for it when it has one.
 */
export interface PlacementRouteParameter {
    /** The name of the parameter, such as `sku`. */
    name: string;

    /** The page's value for it, such as `NK-101`; absent when the page has none yet. */
    value?: string;
}

/**
 * What opening a slice in a routed slot adds to the route: the slot's route parameters, then the slice's segment. Placement
 * reports the parts, not a path; a renderer turns them into the URL (ADR-004), such as `…/NK-101/set-product-price`.
 */
export interface PlacementRoute {
    /** The routed slot. */
    slot: string;

    /** The slot's route parameters, in order. */
    parameters: PlacementRouteParameter[];

    /** The slice's route segment after them, such as `set-product-price`. */
    segment: string;
}
