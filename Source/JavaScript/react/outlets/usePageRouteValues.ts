// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext, useMemo } from 'react';
import { SceneNavigationContextInternal } from '../navigation/SceneNavigationContext';
import { useSceneRouter } from '../routing/SceneRouterContext';

/**
 * The values of the page's route parameters: those of the navigation entry, and those of every routed slot - so an action
 * that opens in the detail pane routed by `sku` knows the selected `NK-101`.
 * @returns The values, by parameter name.
 */
export function usePageRouteValues(): Record<string, string> {
    const navigation = useContext(SceneNavigationContextInternal);
    const router = useSceneRouter();
    const current = navigation?.currentParameters;
    const slots = router.state.slots;
    return useMemo(() => {
        const values: Record<string, string> = { ...(current ?? {}) };
        for (const route of Object.values(slots)) Object.assign(values, route.parameters);
        return values;
    }, [current, slots]);
}
