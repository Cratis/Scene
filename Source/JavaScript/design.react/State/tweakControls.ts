// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    type DesignContext, type DesignOperation, type DesignSession, type DesignSessionEvent, type DesignSystemProposal, type DesignWorkspace, type ResolvedTweak,
    type TweakRecord, lowerTweak, resolveTweak,
} from '@cratis/scene.design';

/** A tweak the session keeps and what it shows now. */
export interface ActiveTweak {
    record: TweakRecord;
    resolved: ResolvedTweak;
}

/**
 * The tweaks on offer for a screen: its own and those of the design as a whole, that have not been dismissed and still resolve to something
 * the design has. A tweak keeps its place until it is dismissed, so a control that stops resolving (its element was removed) just stops showing.
 */
export function activeTweaks(session: DesignSession, screen: string | undefined, workspace: DesignWorkspace, context: DesignContext): ActiveTweak[] {
    const active: ActiveTweak[] = [];
    for (const record of session.tweaks) {
        if (record.dismissed) continue;
        if (record.screen !== undefined && record.screen !== screen) continue;
        const resolved = resolveTweak(record, workspace, context);
        if (resolved !== undefined) active.push({ record, resolved });
    }
    return active;
}

/** The operations (and design-system proposals) of moving a tweak to a value. A tweak is a deterministic edit: no AI is asked. */
export function tweakOperations(record: TweakRecord, value: string): { operations: DesignOperation[]; proposals: DesignSystemProposal[] } {
    return lowerTweak(record, value);
}

/** The event that takes a tweak control away for good. */
export const dismissTweakEvent = (tweakId: string): DesignSessionEvent => ({ type: 'TweakDismissed', tweakId });

interface Rgb { r: number; g: number; b: number }

function parseColour(value: string): Rgb | undefined {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
    if (match === null) return undefined;
    const hex = match[1].length === 3 ? [...match[1]].map(digit => digit + digit).join('') : match[1];
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
}

/** The hue of a hex colour in degrees, 0 to 359; undefined for anything that is not a hex colour, and for greys, which have none. */
export function hueOf(value: string): number | undefined {
    const rgb = parseColour(value);
    if (rgb === undefined) return undefined;
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    if (delta === 0) return undefined;
    const raw = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return Math.round((raw * 60 + 360) % 360);
}

const circularDistance = (a: number, b: number): number => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/**
 * The accent a hue slider stands for: of the accents the design offers, the one whose hue is nearest. Accents that are not colours - names a
 * design system gives its own - are spread round the wheel in the order given, so a slider still reaches every one of them.
 */
export function accentForHue(hue: number, accents: readonly string[]): string | undefined {
    if (accents.length === 0) return undefined;
    const hues = accents.map(hueOf);
    if (hues.every((candidate): candidate is number => candidate !== undefined)) {
        let nearest = 0;
        hues.forEach((candidate, index) => { if (circularDistance(candidate, hue) < circularDistance(hues[nearest]!, hue)) nearest = index; });
        return accents[nearest];
    }
    const step = 360 / accents.length;
    return accents[Math.min(accents.length - 1, Math.floor((((hue % 360) + 360) % 360) / step))];
}

/** The position of a hue slider for the accent now in use: its hue, or its place round the wheel. */
export function hueForAccent(accent: string, accents: readonly string[]): number {
    const own = hueOf(accent);
    if (own !== undefined) return own;
    const index = Math.max(0, accents.indexOf(accent));
    return Math.round((index + 0.5) * (360 / Math.max(1, accents.length)));
}
