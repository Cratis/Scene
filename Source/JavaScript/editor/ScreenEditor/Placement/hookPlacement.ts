// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletSubject, type Layout, type SceneDocument, type ScreenTemplate, type Slot } from '@cratis/scene.model';
import {
    InputSourceKind, argumentSourceKind, placementSlotsOf, resolveEnablement, resolvePlacement,
    type Enablement, type EnablementPersona, type PlacementDecision, type PlacementInput, type PlacementSlot,
} from '@cratis/scene.engine';
import { sliceNamedBy, type StateChangeSlice } from '../Actions/StateChangeSlice';

// What a hook's place and enablement are worked out against (StudioIssues#1331): the slices it may issue, the slots of the page it sits on, and what the page
// can supply to a slice that runs without a form. Studio adds no rule of its own; Scene's resolver answers, and this only says what it is asked about.
export interface PlacementEnvironment {
    slices: readonly StateChangeSlice[];

    // The slots of the page the hook sits on, by role, with whether the page's own content already fills each.
    slots: readonly PlacementSlot[];

    // The fields of the item a hook for an item acts on: what a row of the queries the page shows has.
    itemFields: ReadonlySet<string>;

    // The route parameters the page has, which a slice that runs directly can take its inputs from.
    routeParameters: readonly string[];

    // Who is asked whether the command is allowed; none while editing, so the check is reported as one that cannot be made here.
    persona?: EnablementPersona;
}

// A hook - a button of an outlet of actions, or an `action` component - as far as its place and enablement go.
export interface HookPlacementInput {
    // The slice, by id or by the name of its command.
    slice?: string;
    opens?: Opens;
    opensIn?: string;

    // What the hook acts on: its own, else its outlet's.
    subject?: OutletSubject;
    enabledWhen?: string;

    // The inputs the author mapped by hand, as an `action` component keeps them. A hook of an outlet maps none: each input is taken from the item or the route by its name.
    mapping?: Readonly<Record<string, string>>;
}

export interface HookInspection {
    slice?: StateChangeSlice;

    // The slice has no screen of its own, so it can only run directly.
    screenless: boolean;
    placement?: PlacementDecision;
    enablement: Enablement;
}

// Where each input of the slice gets its value when it runs without a form. A hook that maps its inputs is believed; one that does not takes them as Scene's
// runtime does - from the item it acts on, or the page's route, by the input's name.
export function placementInputsOf(slice: StateChangeSlice, hook: HookPlacementInput, environment: Pick<PlacementEnvironment, 'itemFields' | 'routeParameters'>): PlacementInput[] {
    return slice.inputs.map(input => {
        const source = hook.mapping
            ? argumentSourceKind(hook.mapping[input.name])
            : hook.subject === OutletSubject.Item && environment.itemFields.has(input.name)
                ? InputSourceKind.DataContext
                : environment.routeParameters.includes(input.name) ? InputSourceKind.Route : undefined;
        return source === undefined ? { name: input.name } : { name: input.name, source };
    });
}

// Where the hook's slice opens and when the hook is enabled, as Scene's resolver says.
export function inspectHook(hook: HookPlacementInput, environment: PlacementEnvironment): HookInspection {
    const slice = hook.slice === undefined ? undefined : sliceNamedBy(environment.slices, hook.slice);
    const enablement = resolveEnablement({
        ...(hook.subject ? { subject: hook.subject } : {}),
        ...(slice?.authorize ? { authorize: slice.authorize } : {}),
        ...(environment.persona ? { persona: environment.persona } : {}),
        ...(hook.enabledWhen ? { enabledWhen: hook.enabledWhen } : {}),
    });
    if (!slice) return { screenless: false, enablement };

    const placement = resolvePlacement({
        slice: slice.id,
        ...(hook.opens ? { opens: hook.opens } : {}),
        ...(hook.opensIn ? { opensIn: hook.opensIn } : {}),
        ...(slice.screenless ? {} : { screen: slice.name }),
        ...(slice.fits ? { fits: [...slice.fits] } : {}),
        inputs: placementInputsOf(slice, hook, environment),
        slots: [...environment.slots],
    });
    return { slice, screenless: slice.screenless === true, placement, enablement };
}

const slotsOfTemplate = (document: SceneDocument, templates: readonly ScreenTemplate[], layouts: readonly Layout[], screen: string): { slots: readonly Slot[]; filled: string[] } => {
    const named = document.screens.find(candidate => candidate.name === screen) ?? document.screens[0];
    const filled = Object.entries(named?.slotContent ?? {}).filter(([, content]) => content.length > 0).map(([name]) => name);
    const template = named?.screenTemplate
        ? document.screenTemplates.find(candidate => candidate.name === named.screenTemplate) ?? templates.find(candidate => candidate.name === named.screenTemplate)
        : undefined;
    if (template) return { slots: template.slots, filled };
    const layout = named ? document.layouts.find(candidate => candidate.name === named.layout) ?? layouts.find(candidate => candidate.name === named.layout) : undefined;
    return { slots: layout?.slots ?? [], filled };
};

// The slots of the page the screen is - its template's, else its layout's - with the ones its own content fills.
export function screenPlacementSlots(document: SceneDocument, templates: readonly ScreenTemplate[], layouts: readonly Layout[], screen: string): PlacementSlot[] {
    const { slots, filled } = slotsOfTemplate(document, templates, layouts, screen);
    return placementSlotsOf(slots, filled);
}
