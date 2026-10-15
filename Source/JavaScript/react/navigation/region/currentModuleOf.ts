// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructureIndex } from '@cratis/scene.engine';

/**
 * The module the screen on the page belongs to: the screen's qualified id starts with its module id, so `sales.orders`
 * is in `sales`. Undefined for a screen outside every module - the application level.
 */
export function currentModuleOf(index: ApplicationStructureIndex, screen: string | undefined): string | undefined {
    if (screen === undefined) return undefined;
    const module = screen.split('.')[0];
    return index.findModule(module) ? module : undefined;
}
