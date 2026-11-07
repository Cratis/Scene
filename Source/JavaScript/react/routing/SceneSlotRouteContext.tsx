// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext } from 'react';

/**
 * The route values of the routed slot a screen is drawn in, such as `{ sku: 'NK-101' }` for the detail pane routed by
 * `sku`. A routed `core:slot` provides it around the screen it shows; outside a routed slot it is undefined.
 */
export const SceneSlotRouteContext = createContext<Record<string, string> | undefined>(undefined);

/**
 * The route values of the routed slot the calling component is drawn in.
 * @returns The values by parameter name, or undefined outside a routed slot.
 */
export function useSceneSlotRouteValues(): Record<string, string> | undefined {
    return useContext(SceneSlotRouteContext);
}
