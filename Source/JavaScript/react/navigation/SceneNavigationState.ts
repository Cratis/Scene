// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a navigation host is: the screen in its outlet, the URL that reaches it, the route parameters
 * that URL carries and the dialog open on top of it. It is what a history entry stores, so back, forward
 * and refresh restore exactly this.
 */
export interface SceneNavigationState {
    screen: string;

    /** The URL relative to the host's base path, as `resolveDestination` builds it. */
    url?: string;
    outlet?: string;
    dialog?: string;

    /** Route parameters, from the path template and the query string. */
    parameters: Record<string, string>;
}
