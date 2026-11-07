// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, DestinationReference } from '@cratis/scene.model';
import { identityRoute } from './identityRoute';
import { SceneRoute } from './SceneRoute';

/**
 * The routes a host can deep link to: every screen at its own name, and every slot destination at its
 * authored route override or identity route. A destination listed earlier wins a route it shares with a
 * later one, and authored overrides come before the screen-name defaults.
 */
export function sceneRoutesFrom(screens: string[], destinations: DestinationReference[] = []): SceneRoute[] {
    const routes: SceneRoute[] = [];
    for (const destination of destinations) {
        const kind = destination.kind ?? (destination.dialog ? DestinationKind.Dialog : DestinationKind.Slot);
        const screen = destination.screen ?? destination.slice;
        const route = destination.route ?? identityRoute(destination);
        if (kind !== DestinationKind.Slot || !screen || !route) continue;
        routes.push({ route, screen, ...(destination.slot ? { slot: destination.slot } : {}) });
    }

    return [...routes, ...screens.map(screen => ({ route: screen, screen }))];
}
