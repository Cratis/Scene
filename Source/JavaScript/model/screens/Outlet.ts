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

    /**
     * The semantic template types (`TemplateMetadata.type`) a screen must have to be placed in this outlet,
     * such as `Detail` or `Form`. Absent accepts any screen. A destination that places a screen of another
     * type here is diagnosed as an incompatible outlet rather than rendered somewhere it was not designed for.
     */
    accepts?: string[];
}

export const OutletPropertyNames: (keyof Outlet)[] = ['name', 'description', 'accepts'];
