// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ModuleNode } from './ModuleNode';

/**
 * A read-only description of which modules, features and slices an application has, and what kind each slice is.
 *
 * It is a reference input supplied by the host (Stage's converter, Studio); it is not persisted in a scene document.
 * Ids are the dotted qualified ids already used by `DestinationReference`, for example `sales.orders.PlaceOrder`.
 */
export interface ApplicationStructure {
    /** The modules of the application, in declaration order. */
    modules: ModuleNode[];
}

export const ApplicationStructurePropertyNames: (keyof ApplicationStructure)[] = ['modules'];
