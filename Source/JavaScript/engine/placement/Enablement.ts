// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletSubject } from '@cratis/scene.model';

/**
 * Whether an action can be used. The C# engine uses the same values (`EnablementState`).
 */
export enum EnablementState {
    /** The action can be used. */
    Enabled = 'enabled',

    /** The action is shown but cannot be used yet. */
    Disabled = 'disabled',

    /** The action is not shown, because the persona cannot issue its command. */
    Hidden = 'hidden',
}

/**
 * What enablement checks, in the order it checks them. The C# engine uses the same values (`EnablementCheck`).
 */
export enum EnablementCheck {
    /** An action for an item waits for one to be selected. */
    Subject = 'subject',

    /** The command's authorization hides the action from personas without it. */
    Authorization = 'authorization',

    /** The action's `enabled when` condition. */
    Condition = 'condition',
}

/**
 * How one check turned out. The C# engine uses the same values (`EnablementOutcome`).
 */
export enum EnablementOutcome {
    /** The check lets the action through. */
    Passed = 'passed',

    /** The check holds the action back. */
    Blocked = 'blocked',

    /** The check could not be made here, so it does not hold the action back. */
    Unchecked = 'unchecked',
}

/**
 * One check enablement made, and why it turned out as it did.
 */
export interface EnablementStep {
    /** What was checked. */
    check: EnablementCheck;

    /** How it turned out. */
    outcome: EnablementOutcome;

    /** Why, such as `It is for item, so it waits for a selection`. */
    reason: string;
}

/**
 * The persona an action is shown to, as far as authorization is concerned.
 */
export interface EnablementPersona {
    /** The persona's name, such as `Catalog manager`. */
    name: string;

    /** The policies the persona satisfies. */
    policies: string[];
}

/**
 * What enablement needs to work out whether an action can be used.
 */
export interface EnablementRequest {
    /** What the action acts on; an action for an item waits for a selection. Absent acts on the screen. */
    subject?: OutletSubject;

    /** Whether an item is selected. */
    selected?: boolean;

    /** The selected item, which a structured {@link condition} is evaluated against. */
    item?: unknown;

    /** The policy the command authorizes with, when it has one. */
    authorize?: string;

    /** The persona the action is shown to; absent leaves authorization unchecked. */
    persona?: EnablementPersona;

    /** The action's `enabled when` condition as written, such as `item.status == "onSale"`. */
    enabledWhen?: string;

    /** The condition in its structured guard form, evaluated against {@link item}. */
    condition?: unknown;

    /** Whether the condition holds, when the host evaluated it; it wins over {@link condition}. */
    conditionHolds?: boolean;
}

/**
 * Whether an action can be used, and why.
 */
export interface Enablement {
    /** Whether the action is enabled, disabled or hidden. */
    state: EnablementState;

    /** Why: the reason of the check that decided it, or `Enabled`. */
    reason: string;

    /** Every check made, in order. */
    steps: EnablementStep[];
}
