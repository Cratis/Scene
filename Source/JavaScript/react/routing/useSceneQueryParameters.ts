// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useSceneRouter } from './SceneRouterContext';

/**
 * The values the filters of the page wrote, by query parameter name - what a query the screen shows (or a stat that
 * follows the filters) runs with.
 * @returns The values.
 */
export function useSceneQueryParameters(): Record<string, string> {
    return useSceneRouter().state.query;
}
