// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRouteKey } from '@cratis/scene.engine';
import { identityRoute } from './identityRoute';

/**
 * The route a destination occupies in this renderer: the authored override or the identity-derived route -
 * the same base `resolveDestination` builds a URL from - with surrounding slashes removed and every parameter
 * placeholder (`{id}` or `:id`) reduced to one marker, so `/invoices/{id}` and `invoices/:invoiceId` are the
 * same URL.
 */
export const navigationRouteKey: NavigationRouteKey = destination => {
    const route = destination.route ?? identityRoute(destination);
    if (!route?.trim()) return undefined;
    return route
        .trim()
        .split('/')
        .filter(segment => segment.length > 0)
        .map(segment => (/^\{[^}]*\}$/.test(segment) || /^:.+$/.test(segment) ? '{}' : segment))
        .join('/');
};
