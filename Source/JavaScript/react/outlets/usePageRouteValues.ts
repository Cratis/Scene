// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext, useMemo } from 'react';
import { SceneNavigationContextInternal } from '../navigation/SceneNavigationContext';
import { useSceneRouter } from '../routing/SceneRouterContext';
import { useSceneSlotRouteValues } from '../routing/SceneSlotRouteContext';

/**
 * The values of the page's route parameters: those of the navigation entry, and those of every routed slot - so an action
 * that opens in the detail pane routed by `sku` knows the selected `NK-101`. Inside a screen drawn in a routed slot, that
 * slot's own values win over the page's, so the screen sees the values it was opened with.
 * @returns The values, by parameter name.
 */
export function usePageRouteValues(): Record<string, string> {
    const navigation = useContext(SceneNavigationContextInternal);
    const router = useSceneRouter();
    const slotValues = useSceneSlotRouteValues();
    const current = navigation?.currentParameters;
    const slots = router.state.slots;
    return useMemo(() => {
        const values: Record<string, string> = { ...(current ?? {}) };
        for (const route of Object.values(slots)) Object.assign(values, route.parameters);
        return slotValues === undefined ? values : { ...values, ...slotValues };
    }, [current, slots, slotValues]);
}
