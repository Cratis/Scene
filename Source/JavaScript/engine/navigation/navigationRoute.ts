// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '@cratis/scene.model';

/**
 * Decides which route a destination occupies, so destinations occupying the same one can be compared.
 *
 * The engine constructs no URLs (ADR-004), so it only compares what was authored. A renderer that derives
 * routes from stable identities, or treats parameter spellings as equivalent, supplies its own key - the same
 * derivation it uses when it builds the URL - and gets duplicate routes diagnosed by that rule instead.
 */
export type NavigationRouteKey = (destination: DestinationReference) => string | undefined;

/** The default route key: the authored route override, trimmed, or none. */
export const authoredRouteKey: NavigationRouteKey = destination => destination.route?.trim() || undefined;

/**
 * What a destination opens, so two destinations sharing a route are only a conflict when they open
 * different things.
 */
export function navigationTarget(destination: DestinationReference, kind: string): string {
    const identity = destination.screen ?? [destination.module, destination.feature, destination.slice].filter(part => part).join('.');
    return [kind, identity, destination.dialog ?? '', destination.outlet ?? ''].join('|');
}
