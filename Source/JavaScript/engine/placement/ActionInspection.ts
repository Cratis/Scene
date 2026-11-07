// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit } from '@cratis/scene.model';
import { OutletProvenance } from '../outlets/OutletProvenance';
import { Enablement, EnablementPersona } from './Enablement';
import { PlacementDecision } from './PlacementDecision';
import { PlacementInput } from './PlacementInput';
import { PlacementSlot } from './PlacementSlot';

/**
 * What inspection knows about a slice an action can run: its screen, what the screen fits, its command's inputs and the
 * policy the command authorizes with.
 */
export interface ActionSlice {
    /** The qualified id of the slice. */
    id: string;

    /** The command the slice submits, which a hand-authored action names instead of the slice. */
    command?: string;

    /** The name of the slice's screen; absent when it has none. */
    screen?: string;

    /** The places the screen fits, in order. */
    fits?: ScreenFit[];

    /** The command's inputs, each with the source the slice's hooks feed it from. */
    inputs: PlacementInput[];

    /** The policy the command authorizes with, when it has one. */
    authorize?: string;
}

/**
 * The page and the state the actions of an outlet or an `action` component are inspected against.
 */
export interface ActionInspectionContext {
    /** The slices the actions can run. */
    slices: ActionSlice[];

    /** The slots of the page the actions sit on. */
    slots: PlacementSlot[];

    /** The values of the page's route parameters. */
    routeValues?: Record<string, string>;

    /** Whether an item is selected. */
    selected?: boolean;

    /** The selected item. */
    item?: unknown;

    /** The persona the actions are shown to; absent leaves authorization unchecked. */
    persona?: EnablementPersona;

    /** Whether each action's `enabled when` holds, by action id, when the host evaluated it. */
    conditions?: Record<string, boolean>;
}

/**
 * One action as an editor sees it: where it comes from, where its slice opens, and whether it can be used - each with
 * the reason.
 */
export interface ActionInspection {
    /** The id of the outlet item or element. */
    id: string;

    /** The text the action shows. */
    title: string;

    /** The id of the group the action sits in, when it sits in one. */
    group?: string;

    /** Where the action comes from in the outlet's chain, such as the level `Catalog` by default; absent for an element. */
    provenance?: OutletProvenance;

    /** Whether the level the outlet is resolved for put the action there; absent for an element. */
    editable?: boolean;

    /** The slice the action runs, when it runs one the context knows. */
    slice?: string;

    /** Where the slice opens and why; absent when the action runs no slice the context knows. */
    placement?: PlacementDecision;

    /** Whether the action can be used, and why. */
    enablement: Enablement;
}
