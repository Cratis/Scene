// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, ScreenFit, SlotRole } from '@cratis/scene.model';
import { PlacementProblem } from './PlacementProblem';
import { PlacementRoute } from './PlacementRoute';

/**
 * Whether an action can run its slice directly, without a form, and why.
 */
export interface RunDirectly {
    /** Whether every input has a source. */
    available: boolean;

    /** The inputs with no source, in the command's order. */
    missing: string[];

    /** Why, such as `price has no source, so it needs the form`. */
    reason: string;
}

/**
 * A slot of the page as an `In a slot` choice: whether the slice can open there, and why.
 */
export interface SlotOption {
    /** The name of the slot. */
    name: string;

    /** The slot's role. */
    role: SlotRole;

    /** Whether the slot is routed. */
    routed: boolean;

    /** Whether the slice can open in the slot. */
    offered: boolean;

    /** Why, such as `pane, routed: opening here changes the URL`. */
    reason: string;

    /** What opening the slice in the slot adds to the route, when the slot is routed and the slice can open there. */
    route?: PlacementRoute;
}

/**
 * Where an action's slice opens, and why: what `resolvePlacement` decided.
 */
export interface PlacementDecision {
    /** What the action asked for. */
    requested: Opens;

    /** Where the slice opens: never automatic. Absent when it cannot be placed, and {@link problem} says why. */
    resolved?: Opens;

    /** The place of the screen's fits it opens in, when it opens a screen. */
    fit?: ScreenFit;

    /** The slot it opens in, when it opens in a slot. */
    slot?: string;

    /** Whether opening it changes the URL. Dialogs and drawers are never routed. */
    routed: boolean;

    /** What it adds to the route, when it opens in a routed slot. */
    route?: PlacementRoute;

    /** Why, such as `Drawer: the slice's first fit, and the page has room`. */
    reason: string;

    /** What prevents the slice from opening where the action asks; absent when it can. */
    problem?: PlacementProblem;

    /** Whether the slice could run directly. */
    runDirectly: RunDirectly;

    /** Every slot of the page as an `In a slot` choice, in the page's order. */
    slots: SlotOption[];
}
