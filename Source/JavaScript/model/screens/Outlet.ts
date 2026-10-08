// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A named replacement surface for routed or nested screen content.
 */
export interface Outlet {
    /** Stable outlet name used by destinations. */
    name: string;

    /** Optional description for designers. */
    description?: string;
}

export const OutletPropertyNames: (keyof Outlet)[] = ['name', 'description'];
