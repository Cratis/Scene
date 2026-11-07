// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { emptySceneRouteState, SceneRouter, SceneRouteState } from './SceneRouter';
import { withQueryParameter, withSlotClosed, withSlotOpened, withTabSelected } from './sceneRouteState';

/**
 * A router that keeps the route state in memory: the default for previews, design-time hosts and specifications, which
 * do not own an address bar.
 * @param initial The state to start from.
 * @returns The router.
 */
export function useMemorySceneRouter(initial: SceneRouteState = emptySceneRouteState): SceneRouter {
    const [state, setState] = useState(initial);
    return useMemo<SceneRouter>(() => ({
        state,
        openInSlot: (slot, route) => setState(current => withSlotOpened(current, slot, route)),
        closeSlot: slot => setState(current => withSlotClosed(current, slot)),
        selectTab: (outlet, tab) => setState(current => withTabSelected(current, outlet, tab)),
        setQueryParameter: (name, value) => setState(current => withQueryParameter(current, name, value)),
    }), [state]);
}
