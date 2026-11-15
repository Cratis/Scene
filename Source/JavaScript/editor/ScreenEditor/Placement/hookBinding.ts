// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletSubject } from '@cratis/scene.model';
import { EnablementState, type Enablement } from '@cratis/scene.engine';
import type { HookPlacementInput, PlacementEnvironment } from './hookPlacement';
import { inspectHook } from './hookPlacement';
import { defaultPlacementStrings, type PlacementStrings } from './PlacementStrings';

// What the editors of a hook's Opens and Enabled are given: the value they edit, and the hook it belongs to - so they can ask Scene where it opens and when it is enabled
// - with what the outlet acts on. What they hand back is the value alone.
export interface HookOpensValue {
    value: string;
    hook: HookPlacementInput;
}

export interface HookEnabledValue extends EnabledValue {
    hook: HookPlacementInput;
    outletSubject?: OutletSubject;
}

// How a hook's Opens is carried by the one value an editor changes: the way it opens, and for a slot which one - `slot:detail`.
export const opensValueOf = (opens: Opens | undefined, opensIn: string | undefined): string =>
    opens === Opens.Slot ? (opensIn ? `slot:${opensIn}` : 'slot') : opens ?? Opens.Automatic;

// What the hook becomes when the value is chosen: the way it opens and the slot, with nothing for what is cleared. Automatic is the absence of both.
export function opensChangeOf(given: unknown): { opens?: Opens; opensIn?: string } | undefined {
    const value = typeof given === 'object' && given !== null && 'value' in given ? (given as HookOpensValue).value : given;
    if (value === undefined || value === null || value === '' || value === Opens.Automatic) return { opens: undefined, opensIn: undefined };
    if (typeof value !== 'string') return undefined;
    if (value === Opens.Slot) return { opens: Opens.Slot, opensIn: undefined };
    if (value.startsWith('slot:')) return { opens: Opens.Slot, opensIn: value.slice('slot:'.length) || undefined };
    return (Object.values(Opens) as string[]).includes(value) ? { opens: value as Opens, opensIn: undefined } : undefined;
}

// What the Enabled editor changes, and what the hook stores of it: the subject it acts on and the condition it adds.
export interface EnabledValue {
    subject?: OutletSubject;
    enabledWhen?: string;
}

export function enabledChangeOf(value: unknown): { subject?: OutletSubject; enabledWhen?: string } | undefined {
    if (value === undefined || value === null) return { subject: undefined, enabledWhen: undefined };
    if (typeof value !== 'object') return undefined;
    const { subject, enabledWhen } = value as EnabledValue;
    return {
        subject: subject === OutletSubject.Item || subject === OutletSubject.Screen ? subject : undefined,
        enabledWhen: typeof enabledWhen === 'string' && enabledWhen.trim() !== '' ? enabledWhen.trim() : undefined,
    };
}

// The words an Opens chip says: the way it opens, and for Automatic where that works out to - `Automatic · Drawer` - or that nothing fits.
export function opensChipText(hook: HookPlacementInput, environment: PlacementEnvironment | undefined, text: PlacementStrings = defaultPlacementStrings): string {
    const labelOf = (opens: Opens | undefined) => text.choices[(opens ?? Opens.Automatic) as keyof PlacementStrings['choices']]?.label ?? String(opens);
    if (hook.opens === Opens.Slot) return text.chipSlot(hook.opensIn ?? text.choices.slot.label);
    if (hook.opens !== undefined && hook.opens !== Opens.Automatic) return labelOf(hook.opens);
    if (!environment || !hook.slice) return labelOf(Opens.Automatic);

    const placement = inspectHook(hook, environment).placement;
    if (!placement) return labelOf(Opens.Automatic);
    if (placement.resolved === undefined) return text.chipNothingFits;
    return text.chipAutomatic(placement.resolved === Opens.Slot ? text.chipSlot(placement.slot ?? '') : labelOf(placement.resolved));
}

// The words an Enabled chip says: what the hook acts on and the condition it adds - or that it is always enabled.
export function enabledChipText(hook: HookPlacementInput, outletSubject: OutletSubject | undefined, text: PlacementStrings = defaultPlacementStrings): string {
    const subject = hook.subject ?? outletSubject;
    const parts = [
        ...(subject === OutletSubject.Item ? [text.chipForItem] : []),
        ...(hook.enabledWhen ? [text.chipWhen(hook.enabledWhen)] : []),
    ];
    return parts.length > 0 ? parts.join(' · ') : text.alwaysEnabled;
}

// Why a hook is disabled or hidden, in Scene's words, or nothing when it is enabled.
export const whyDisabled = (enablement: Enablement): string | undefined => enablement.state === EnablementState.Enabled ? undefined : enablement.reason;
