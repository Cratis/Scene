// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a navigation host is: the screen in its slot, the URL that reaches it, the route parameters
 * that URL carries and the dialog open on top of it. It is what a history entry stores, so back, forward
 * and refresh restore exactly this.
 */
export interface SceneNavigationState {
    /** The screen the last navigation opened - in the primary region or in a nested slot. */
    screen: string;

    /**
     * The screen in the primary region. Absent means `screen`: a navigation into a slot no rendered screen
     * declares replaces the primary region, as before nested slots existed.
     */
    primary?: string;

    /**
     * Which screen each nested slot shows, by slot name. A slot is nested when a screen declares it with
     * a `core:slot` element; placing a screen there keeps every screen above it on the page.
     */
    slots?: Record<string, string>;

    /** The URL relative to the host's base path, as `resolveDestination` builds it. */
    url?: string;
    slot?: string;
    dialog?: string;

    /** The parameters the open dialog was opened with, by name. */
    dialogParameters?: Record<string, string>;

    /** Route parameters, from the path template and the query string. */
    parameters: Record<string, string>;
}
