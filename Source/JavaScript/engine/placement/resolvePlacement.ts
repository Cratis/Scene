// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, ScreenFit, Slot, SlotRole } from '@cratis/scene.model';
import { resolveSlotRole } from '../slots/resolveSlotRole';
import { PlacementDecision, RunDirectly, SlotOption } from './PlacementDecision';
import { PlacementProblem } from './PlacementProblem';
import { PlacementRequest } from './PlacementRequest';
import { PlacementRoute } from './PlacementRoute';
import { PlacementSlot } from './PlacementSlot';

const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
const overThePage = new Set<ScreenFit>([ScreenFit.Dialog, ScreenFit.Drawer]);

function label(fit: ScreenFit): string {
    return `${fit[0].toUpperCase()}${fit.slice(1)}`;
}

function list(words: readonly string[], conjunction: string): string {
    if (words.length <= 1) return words.join('');
    return `${words.slice(0, -1).join(', ')} ${conjunction} ${words[words.length - 1]}`;
}

function normalizeOpens(opens: Opens | string | undefined): Opens {
    const value = typeof opens === 'string' ? opens.toLowerCase() : undefined;
    return Object.values(Opens).find(candidate => candidate === value) ?? Opens.Automatic;
}

function normalizeRole(role: SlotRole | string): SlotRole {
    const value = String(role).toLowerCase();
    return Object.values(SlotRole).find(candidate => candidate === value) ?? SlotRole.Pane;
}

/**
 * The places a screen fits, in order, with unknown values and repeats left out. A screen that lists none fits a dialog,
 * where a command's form opened before screens listed what they fit.
 * @param fits The fits the screen lists.
 * @returns The effective fits.
 */
export function effectiveFits(fits: readonly (ScreenFit | string)[] | undefined): ScreenFit[] {
    const declared = declaredFits(fits);
    return declared.length === 0 ? [ScreenFit.Dialog] : declared;
}

function declaredFits(fits: readonly (ScreenFit | string)[] | undefined): ScreenFit[] {
    const result: ScreenFit[] = [];
    for (const fit of fits ?? []) {
        const known = Object.values(ScreenFit).find(candidate => candidate === String(fit).toLowerCase());
        if (known !== undefined && !result.includes(known)) result.push(known);
    }
    return result;
}

/**
 * Turns a slice id into the route segment it opens as: the last part of the id in kebab case, so
 * `Catalog.Products.SetProductPrice` becomes `set-product-price`.
 * @param slice The qualified id of the slice.
 * @returns The segment.
 */
export function sliceRouteSegment(slice: string): string {
    const name = slice.slice(slice.lastIndexOf('.') + 1);
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();
}

function routeOf(slot: PlacementSlot, request: PlacementRequest): PlacementRoute {
    const parameters = (slot.routedBy ?? []).map(name => {
        const value = request.routeValues?.[name];
        return value === undefined ? { name } : { name, value };
    });
    return { slot: slot.name, parameters, segment: sliceRouteSegment(request.slice) };
}

function isFree(slot: PlacementSlot): boolean {
    return slot.routed === true || slot.filled !== true;
}

function runDirectlyOf(request: PlacementRequest): RunDirectly {
    const missing = request.inputs.filter(input => input.source === undefined).map(input => input.name);
    if (missing.length === 0) return { available: true, missing, reason: 'Every input has a source' };
    return { available: false, missing, reason: `${missingPhrase(missing)}, so ${missing.length === 1 ? 'it needs' : 'they need'} the form` };
}

function missingPhrase(missing: readonly string[]): string {
    return `${list(missing, 'and')} ${missing.length === 1 ? 'has' : 'have'} no source`;
}


function slotOptionsOf(request: PlacementRequest, fits: readonly ScreenFit[]): SlotOption[] {
    return request.slots.map(slot => {
        const role = normalizeRole(slot.role);
        const routed = slot.routed === true;
        const option = { name: slot.name, role, routed };
        if (request.screen === undefined) return { ...option, offered: false, reason: 'Not offered: the slice has no screen' };
        if (!fits.includes(role as string as ScreenFit)) return { ...option, offered: false, reason: `Not offered: the slice doesn't list ${role} in what it fits` };
        if (!isFree(slot)) return { ...option, offered: false, reason: 'Not offered: it is already filled' };
        if (!routed) return { ...option, offered: true, reason: `${role}: free` };
        return { ...option, offered: true, reason: `${role}, routed: opening here changes the URL`, route: routeOf(slot, request) };
    });
}

function inSlot(slot: PlacementSlot, request: PlacementRequest): Pick<PlacementDecision, 'resolved' | 'fit' | 'slot' | 'routed' | 'route'> {
    const routed = slot.routed === true;
    return {
        resolved: Opens.Slot,
        fit: normalizeRole(slot.role) as string as ScreenFit,
        slot: slot.name,
        routed,
        route: routed ? routeOf(slot, request) : undefined,
    };
}

function withRoute(reason: string, route: PlacementRoute | undefined): string {
    return route === undefined ? reason : `${reason}; it is routed, so opening it changes the URL`;
}

type Outcome = Omit<PlacementDecision, 'requested' | 'runDirectly' | 'slots'>;

function cannotPlace(problem: PlacementProblem, reason: string): Outcome {
    return { routed: false, reason, problem };
}

function automatic(request: PlacementRequest, fits: readonly ScreenFit[], runDirectly: RunDirectly): Outcome {
    if (request.screen === undefined) {
        if (runDirectly.available) return { resolved: Opens.None, routed: false, reason: 'Runs directly: the slice has no screen' };
        return cannotPlace(PlacementProblem.InputsWithoutSource, `The slice has no screen, so it can only run directly, but ${missingPhrase(runDirectly.missing)}`);
    }

    const listsNoFits = declaredFits(request.fits).length === 0;
    const skipped: string[] = [];
    for (const [index, fit] of fits.entries()) {
        if (overThePage.has(fit)) {
            const reason = listsNoFits
                ? `${label(fit)}: the screen lists no fits, so it opens in a dialog`
                : reasonFor(fit, index, skipped);
            return { resolved: fit === ScreenFit.Dialog ? Opens.Dialog : Opens.Drawer, fit, routed: false, reason };
        }

        const slot = request.slots.find(candidate => normalizeRole(candidate.role) as string === fit && isFree(candidate));
        if (slot === undefined) {
            if (!skipped.includes(fit)) skipped.push(fit);
            continue;
        }

        const placed = inSlot(slot, request);
        const reason = index === 0
            ? `${label(fit)}: the slice's first fit, and the page has room in '${slot.name}'`
            : `${reasonFor(fit, index, skipped)}; it opens in '${slot.name}'`;
        return { ...placed, reason: withRoute(reason, placed.route) };
    }

    return cannotPlace(PlacementProblem.NothingFits, `Nothing: the page has no free ${list(fits, 'or')} for the slice`);
}

function reasonFor(fit: ScreenFit, index: number, skipped: readonly string[]): string {
    const ordinal = ordinals[index] ?? `${index + 1}th`;
    if (index === 0) return `${label(fit)}: the slice's first fit, and the page has room`;
    return `${label(fit)}: the slice's ${ordinal} fit, since the page has no free ${list(skipped, 'or')}`;
}

function overPage(request: PlacementRequest, fits: readonly ScreenFit[], fit: ScreenFit, opens: Opens): Outcome {
    if (request.screen === undefined) return cannotPlace(PlacementProblem.NoScreen, 'The slice has no screen, so it can only run directly');
    if (!fits.includes(fit)) return cannotPlace(PlacementProblem.NotFitted, `The slice doesn't list ${fit} in what it fits`);
    return { resolved: opens, fit, routed: false, reason: `${label(fit)}: chosen on the trigger` };
}

function explicitSlot(request: PlacementRequest, fits: readonly ScreenFit[]): Outcome {
    const name = request.opensIn;
    if (name === undefined || name.length === 0) return cannotPlace(PlacementProblem.SlotNotNamed, 'It opens in a slot, but names none');
    if (request.screen === undefined) return cannotPlace(PlacementProblem.NoScreen, 'The slice has no screen, so it can only run directly');
    const slot = request.slots.find(candidate => candidate.name === name);
    if (slot === undefined) return cannotPlace(PlacementProblem.SlotNotDeclared, `The page has no slot named '${name}'`);
    const role = normalizeRole(slot.role);
    if (!fits.includes(role as string as ScreenFit)) {
        return cannotPlace(PlacementProblem.RoleNotFitted, `The slice doesn't list ${role} in what it fits, so it cannot open in '${name}'`);
    }
    if (!isFree(slot)) return cannotPlace(PlacementProblem.SlotFilled, `'${name}' is already filled by the page's content`);
    const placed = inSlot(slot, request);
    return { ...placed, reason: withRoute(`In '${name}': chosen on the trigger`, placed.route) };
}

function runs(runDirectly: RunDirectly): Outcome {
    if (!runDirectly.available) return cannotPlace(PlacementProblem.InputsWithoutSource, runDirectly.reason);
    return { resolved: Opens.None, routed: false, reason: 'Runs directly: every input has a source' };
}

/**
 * Works out where an action's slice opens, and why. The C# engine answers the same (`PlacementResolver.Resolve`).
 *
 * - The page always has a dialog and a drawer; they sit over it and are never routed. A page, a pane and a panel are
 *   slots of the page, matched by role. A slot is free unless the page's own content fills it; a routed slot is always
 *   free, because opening something there replaces what it shows.
 * - Automatic takes the screen's first fit the page has free. A slice with no screen runs directly when every input has
 *   a source, and cannot be placed otherwise.
 * - Run directly needs a source for every input.
 * - A dialog or a drawer must be one of the screen's fits.
 * - A slot must be named, declared by the page, of a role the screen fits, and free.
 * - A routed slot reports what opening the slice there adds to the route - the slot's route parameters with the page's
 *   values, then the slice's name in kebab case - as parts, not a path: a renderer builds the URL (ADR-004).
 * @param request What the action asks for, what the slice fits, and the page's slots.
 * @returns The decision, with the reason, whether the slice could run directly, and every slot as a choice.
 */
export function resolvePlacement(request: PlacementRequest): PlacementDecision {
    const requested = normalizeOpens(request.opens);
    const fits = effectiveFits(request.fits);
    const runDirectly = runDirectlyOf(request);
    const slots = slotOptionsOf(request, fits);

    const outcome = (() => {
        switch (requested) {
            case Opens.None: return runs(runDirectly);
            case Opens.Dialog: return overPage(request, fits, ScreenFit.Dialog, Opens.Dialog);
            case Opens.Drawer: return overPage(request, fits, ScreenFit.Drawer, Opens.Drawer);
            case Opens.Slot: return explicitSlot(request, fits);
            default: return automatic(request, fits, runDirectly);
        }
    })();

    return compact({ requested, ...outcome, runDirectly, slots: slots.map(compact) });
}

function compact<T extends object>(value: T): T {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

/**
 * The slots of a layout or screen template as placement sees them: each with its resolved role, routing, and whether the
 * page's own content fills it.
 * @param slots The slots the page declares.
 * @param filled The names of the slots the page's own content fills.
 * @returns The slots for {@link resolvePlacement}.
 */
export function placementSlotsOf(slots: readonly Slot[], filled: readonly string[]): PlacementSlot[] {
    return slots.map(slot => ({
        name: slot.name,
        role: resolveSlotRole(slot),
        filled: filled.includes(slot.name),
        routed: slot.routed === true,
        routedBy: slot.routedBy ?? [],
    }));
}
