// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, DestinationReference } from '@cratis/scene.model';
import { EffectiveNavItem, primarySlot } from '@cratis/scene.engine';

/** The screen an item opens by default: the qualified id of the feature it resolves to. */
export function defaultScreenFor(item: EffectiveNavItem): string | undefined {
    return item.target?.resolvedFeature;
}

/**
 * Where activating a navigation item goes: its stable module/feature identity, the screen it opens, and the slot it
 * renders into as the outlet - the primary `content` slot is the host's primary outlet.
 *
 * @param item The effective item.
 * @param screenFor Names the screen an item opens; {@link defaultScreenFor} when absent.
 * @returns The destination, or undefined when the item leads nowhere.
 */
export function navigationItemDestination(item: EffectiveNavItem, screenFor: (item: EffectiveNavItem) => string | undefined = defaultScreenFor): DestinationReference | undefined {
    const screen = screenFor(item);
    if (screen === undefined || item.target === undefined) return undefined;

    const resolved = item.target.resolvedFeature;
    const destination: DestinationReference = { kind: DestinationKind.Outlet, module: item.target.module, screen };
    if (resolved !== undefined && resolved.startsWith(`${item.target.module}.`)) destination.feature = resolved.substring(item.target.module.length + 1);
    if (item.slot !== primarySlot) destination.outlet = item.slot;
    return destination;
}
