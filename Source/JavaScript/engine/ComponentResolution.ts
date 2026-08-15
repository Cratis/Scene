// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The outcome of resolving a bare or package-qualified component name against a {@link UiProfile}'s
 * package list.
 */
export interface ComponentResolution {
    /** The bare component name within {@link package}. */
    name: string;

    /** The package the name resolved to. */
    package: string;

    /**
     * Other active packages, in descending priority order, that also declare this name but were
     * shadowed by {@link package} - this is what answers "why did this resolve to X and not Y". Always
     * empty for a package-qualified reference, which resolves directly against its named package and
     * never runs shadow tracking.
     */
    shadows: string[];
}
