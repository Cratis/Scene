// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingScope, resolveBindingExpression } from '@cratis/scene.engine';
import { DestinationKind, DestinationReference } from '@cratis/scene.model';
import { DestinationResolution } from './DestinationResolution';
import { identityRoute } from './identityRoute';

/**
 * Resolves a destination into a renderer-neutral navigation action, deep link and target outlet/dialog.
 */
export function resolveDestination(destination: DestinationReference, scope: BindingScope = {}): DestinationResolution {
    const diagnostics: string[] = [];
    const kind = destination.kind ?? (destination.dialog ? DestinationKind.Dialog : DestinationKind.Outlet);
    const parameters = Object.entries(destination.routeParameterBindings ?? {})
        .map(([name, binding]) => [name, String(resolveBindingExpression(binding, scope) ?? '')] as const);
    const base = destination.route ?? identityRoute(destination);
    if (!base && kind !== DestinationKind.Dialog) diagnostics.push('Destination has no routeable screen, stable identity or route.');

    const url = base ? appendParameters(base, parameters) : undefined;
    return {
        kind,
        url,
        outlet: destination.outlet,
        dialog: destination.dialog,
        parameters: Object.fromEntries(parameters),
        action: kind === DestinationKind.Dialog ? 'openDialog' : kind === DestinationKind.External ? 'openExternal' : 'navigate',
        diagnostics,
    };
}

function appendParameters(route: string, parameters: readonly (readonly [string, string])[]): string {
    if (!parameters.length) return route;
    let replaced = route;
    const unused: string[] = [];
    for (const [name, value] of parameters) {
        const marker = `{${name}}`;
        if (replaced.includes(marker)) {
            replaced = replaced.split(marker).join(encodeURIComponent(value));
        } else {
            unused.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
        }
    }

    return unused.length ? `${replaced}?${unused.join('&')}` : replaced;
}
