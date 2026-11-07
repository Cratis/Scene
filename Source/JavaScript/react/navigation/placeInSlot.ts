// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '@cratis/scene.model';
import { shellSlotOwner } from './collectSlotOwners';
import { SceneNavigationState } from './SceneNavigationState';

/** The most levels of nesting a placement follows before it stops, so a cyclic model cannot loop forever. */
const maximumDepth = 32;

/**
 * Places a screen, recursively composing nested slots.
 *
 * When `slot` is a nested slot - one a screen declares with `core:slot` - the screen goes into it, and
 * the screen that declares it is placed first: where it already is, or, when it is not on the page, where a
 * known destination puts it, up to the primary region. Slots declared by screens that are no longer on the
 * page are dropped. A slot the shell declares ({@link shellSlotOwner}) takes the screen beside the primary region, which keeps its
 * screen, and keeps it when the primary region changes. Any other slot replaces the primary region and clears every nested placement.
 */
export function placeInSlot(
    current: SceneNavigationState,
    screen: string,
    slot: string | undefined,
    owners: Record<string, string>,
    destinations: DestinationReference[] = [],
): Pick<SceneNavigationState, 'primary' | 'slots'> {
    const primary = current.primary ?? current.screen;
    const placements: Record<string, string> = { ...(current.slots ?? {}) };
    let root = primary;

    let target: { screen: string; slot: string | undefined } | undefined = { screen, slot };
    for (let depth = 0; target && depth < maximumDepth; depth++) {
        const owner = target.slot === undefined ? undefined : owners[target.slot];
        if (owner === undefined) {
            root = target.screen;
            break;
        }

        placements[target.slot!] = target.screen;
        if (owner === shellSlotOwner) break;
        if (isOnPage(owner, root, placements, owners)) break;
        target = { screen: owner, slot: destinations.find(destination => destination.screen === owner && destination.slot)?.slot };
    }

    return { primary: root, slots: reachable(root, placements, owners) };
}

/** Whether a screen is the root or shown in a slot reachable from it. */
function isOnPage(screen: string, root: string, placements: Record<string, string>, owners: Record<string, string>): boolean {
    return screen === root || Object.values(reachable(root, placements, owners)).includes(screen);
}

/** Only the placements reachable from the root through the slots each placed screen declares. */
function reachable(root: string, placements: Record<string, string>, owners: Record<string, string>): Record<string, string> {
    const kept: Record<string, string> = {};
    const pending = [root];
    const seen = new Set<string>();
    for (const [slot, placed] of Object.entries(placements)) {
        if (owners[slot] === shellSlotOwner) {
            kept[slot] = placed;
            pending.push(placed);
        }
    }

    while (pending.length > 0) {
        const screen = pending.shift()!;
        if (seen.has(screen)) continue;
        seen.add(screen);
        for (const [slot, placed] of Object.entries(placements)) {
            if (owners[slot] === screen) {
                kept[slot] = placed;
                pending.push(placed);
            }
        }
    }

    return kept;
}
