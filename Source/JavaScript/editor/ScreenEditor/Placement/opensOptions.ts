// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens } from '@cratis/scene.model';
import type { PlacementDecision, PlacementRoute, SlotOption } from '@cratis/scene.engine';
import { inspectHook, type HookInspection, type HookPlacementInput, type PlacementEnvironment } from './hookPlacement';

// One way a hook can open its slice, as the choice lists it (6e): whether it can be chosen, and why - or why not - in Scene's own words.
export interface OpensOption {
    value: Opens;
    available: boolean;
    reason: string;
}

// What the Opens choice shows for a hook: the choices with their reasons, what Automatic resolves to, the slots a slice can be put in, and the inspection they came from.
export interface OpensChoices {
    inspection: HookInspection;

    // The decision for the hook as it is now; nothing when it names no slice yet.
    decision?: PlacementDecision;
    options: readonly OpensOption[];

    // The slots of the page with whether the slice can go in each and the URL a routed one would produce. Each is greyed, with the reason, when the slice cannot go there.
    slots: readonly SlotOption[];
}

const choosable: readonly Opens[] = [Opens.Automatic, Opens.None, Opens.Dialog, Opens.Drawer, Opens.Slot];

// The URL a routed slot turns the opening into: the route values the page has, `:name` where it has none yet, and the slice's own segment.
export const routeText = (route: PlacementRoute): string => ['…', ...route.parameters.map(parameter => parameter.value ?? `:${parameter.name}`), route.segment].join('/');

const withoutSlot = (hook: HookPlacementInput): HookPlacementInput => {
    const { opensIn: _, ...rest } = hook;
    return rest;
};

const decisionFor = (hook: HookPlacementInput, environment: PlacementEnvironment, opens: Opens): PlacementDecision =>
    inspectHook({ ...(opens === Opens.Slot ? hook : withoutSlot(hook)), opens }, environment).placement!;

// The choices a hook has for where its slice opens. Every one is worked out by Scene's resolver, so a choice is disabled for the reason the resolver gives - the
// input with no source, the role the slice does not fit, the slot that is already filled - and Studio adds no reason of its own.
export function opensChoicesFor(hook: HookPlacementInput, environment: PlacementEnvironment): OpensChoices {
    const inspection = inspectHook(hook, environment);
    const decision = inspection.placement;
    if (!decision) return { inspection, options: [], slots: [] };

    const options = choosable.map((value): OpensOption => {
        if (value === Opens.Automatic) return { value, available: true, reason: decisionFor(hook, environment, Opens.Automatic).reason };
        if (value === Opens.None) return { value, available: decision.runDirectly.available, reason: decision.runDirectly.reason };
        if (value === Opens.Slot) {
            const offered = decision.slots.filter(slot => slot.offered);
            return { value, available: offered.length > 0, reason: offered.length > 0 ? '' : decision.slots[0]?.reason ?? '' };
        }

        const chosen = decisionFor(hook, environment, value);
        return { value, available: chosen.resolved !== undefined, reason: chosen.reason };
    });
    return { inspection, decision, options, slots: decision.slots };
}
