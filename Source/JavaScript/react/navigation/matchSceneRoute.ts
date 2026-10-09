// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneRoute } from './SceneRoute';

/** A URL matched to the route that opens it. */
export interface SceneRouteMatch {
    route: SceneRoute;
    parameters: Record<string, string>;
}

/**
 * Matches a URL - as a deep link, a refresh or a typed address delivers it - against route templates.
 * `{name}` segments capture path parameters; the query string adds the rest. Literal segments win over
 * parameters, so `orders/new` beats `orders/{orderId}`, and routes are otherwise tried in the given order.
 */
export function matchSceneRoute(url: string, routes: SceneRoute[]): SceneRouteMatch | undefined {
    const [path, query = ''] = url.split('?', 2);
    const segments = path.split('/').filter(segment => segment.length > 0).map(decodeURIComponent);
    const queryParameters = Object.fromEntries(new URLSearchParams(query));

    const candidates = routes
        .map((route, order) => ({ route, order, template: route.route.split('/').filter(segment => segment.length > 0) }))
        .filter(candidate => candidate.template.length === segments.length)
        .sort((left, right) => literalCount(right.template) - literalCount(left.template) || left.order - right.order);

    for (const { route, template } of candidates) {
        const parameters: Record<string, string> = {};
        const matches = template.every((part, index) => {
            const name = /^\{([^}]+)\}$/.exec(part)?.[1];
            if (name) {
                parameters[name] = segments[index];
                return true;
            }
            return part === segments[index];
        });
        if (matches) return { route, parameters: { ...queryParameters, ...parameters } };
    }

    return undefined;
}

function literalCount(template: string[]): number {
    return template.filter(part => !/^\{[^}]+\}$/.test(part)).length;
}
