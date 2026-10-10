// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a navigation host is: the screen in its outlet, the URL that reaches it, the route parameters
 * that URL carries and the dialog open on top of it. It is what a history entry stores, so back, forward
 * and refresh restore exactly this.
 */
export interface SceneNavigationState {
    /** The screen the last navigation opened - in the primary region or in a nested outlet. */
    screen: string;

    /**
     * The screen in the primary region. Absent means `screen`: a navigation into an outlet no rendered screen
     * declares replaces the primary region, as before nested outlets existed.
     */
    primary?: string;

    /**
     * Which screen each nested outlet shows, by outlet name. An outlet is nested when a screen declares it with
     * a `core:outlet` element; placing a screen there keeps every screen above it on the page.
     */
    outlets?: Record<string, string>;

    /** The URL relative to the host's base path, as `resolveDestination` builds it. */
    url?: string;
    outlet?: string;
    dialog?: string;

    /** Route parameters, from the path template and the query string. */
    parameters: Record<string, string>;
}
