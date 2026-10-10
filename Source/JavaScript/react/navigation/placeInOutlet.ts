// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '@cratis/scene.model';
import { SceneNavigationState } from './SceneNavigationState';

/** The most levels of nesting a placement follows before it stops, so a cyclic model cannot loop forever. */
const maximumDepth = 32;

/**
 * Places a screen, recursively composing nested outlets.
 *
 * When `outlet` is a nested outlet - one a screen declares with `core:outlet` - the screen goes into it, and
 * the screen that declares it is placed first: where it already is, or, when it is not on the page, where a
 * known destination puts it, up to the primary region. Outlets declared by screens that are no longer on the
 * page are dropped. Any other outlet replaces the primary region and clears every nested placement.
 */
export function placeInOutlet(
    current: SceneNavigationState,
    screen: string,
    outlet: string | undefined,
    owners: Record<string, string>,
    destinations: DestinationReference[] = [],
): Pick<SceneNavigationState, 'primary' | 'outlets'> {
    const primary = current.primary ?? current.screen;
    const placements: Record<string, string> = { ...(current.outlets ?? {}) };
    let root = primary;

    let target: { screen: string; outlet: string | undefined } | undefined = { screen, outlet };
    for (let depth = 0; target && depth < maximumDepth; depth++) {
        const owner = target.outlet === undefined ? undefined : owners[target.outlet];
        if (owner === undefined) {
            root = target.screen;
            break;
        }

        placements[target.outlet!] = target.screen;
        if (isOnPage(owner, root, placements, owners)) break;
        target = { screen: owner, outlet: destinations.find(destination => destination.screen === owner && destination.outlet)?.outlet };
    }

    return { primary: root, outlets: reachable(root, placements, owners) };
}

/** Whether a screen is the root or shown in an outlet reachable from it. */
function isOnPage(screen: string, root: string, placements: Record<string, string>, owners: Record<string, string>): boolean {
    return screen === root || Object.values(reachable(root, placements, owners)).includes(screen);
}

/** Only the placements reachable from the root through the outlets each placed screen declares. */
function reachable(root: string, placements: Record<string, string>, owners: Record<string, string>): Record<string, string> {
    const kept: Record<string, string> = {};
    const pending = [root];
    const seen = new Set<string>();
    while (pending.length > 0) {
        const screen = pending.shift()!;
        if (seen.has(screen)) continue;
        seen.add(screen);
        for (const [outlet, placed] of Object.entries(placements)) {
            if (owners[outlet] === screen) {
                kept[outlet] = placed;
                pending.push(placed);
            }
        }
    }

    return kept;
}
