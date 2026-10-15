// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a navigation item goes, resolved against the application structure.
 */
export interface ResolvedNavigationTarget {
    /** The module the item targets. */
    module: string;

    /** The feature the item names, a dotted path inside the module; absent when it targets the module. */
    feature?: string;

    /**
     * The qualified id of the feature the item opens: the named feature, or for a module target the module's first
     * feature. Absent when the module or feature does not exist, or the module has no features.
     */
    resolvedFeature?: string;
}
