// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ComponentResolution } from './ComponentResolution';

/** The name of the package that is always present as the final fallback, regardless of what a {@link UiProfile} lists in its own `packages`. */
export const corePackage = 'core';

/** Every active package's declared component names, keyed by package name. */
export type PackageCatalog = Record<string, string[]>;

/**
 * Computes a {@link UiProfile}'s effective package priority order - its own declared packages, with
 * {@link corePackage} prepended as the final fallback when not already present. {@link corePackage} is
 * the lowest-priority fallback, so it belongs at the front of the ascending-priority order, not the
 * back - prepending it (rather than appending) is what makes every explicitly listed package outrank it.
 *
 * @returns The packages in ascending priority order - the last entry wins when more than one declares the same name.
 */
export function effectivePackages(profile: UiProfile): string[] {
    return profile.packages.includes(corePackage) ? profile.packages : [corePackage, ...profile.packages];
}

/**
 * Resolves a component name against a {@link UiProfile} - the runtime half of Cratis/Scene#3, run
 * whenever a profile is applied. Studio's design-time tooling and Stage's build-time resolution use the
 * C# twin of this algorithm in `Cratis.Scene.Engine`; both sides are asserted against the same shared
 * fixture corpus so they cannot drift apart.
 *
 * A name containing a `.` is package-qualified - everything before the last `.` is the package,
 * everything after is the bare name - and resolves directly against that one package, bypassing shadow
 * tracking and the profile's priority order entirely (an author naming the package explicitly has
 * already disambiguated). A name with no `.` is bare and resolves by walking {@link effectivePackages}
 * from highest to lowest priority; every other active package that also declares the name is recorded in
 * the result's `shadows`, not discarded, so a caller can explain the pick rather than only report it.
 *
 * @param requestedName The name as written on a screen - bare (`button`) or package-qualified (`Internal.Widgets.TrendChart`).
 * @param profile The {@link UiProfile} whose package list to resolve against.
 * @param catalog Every active package's declared component names, keyed by package name.
 * @returns The {@link ComponentResolution}, or `undefined` when nothing in scope declares the name.
 */
export function resolveComponentName(requestedName: string, profile: UiProfile, catalog: PackageCatalog): ComponentResolution | undefined {
    const lastDot = requestedName.lastIndexOf('.');
    if (lastDot >= 0) {
        const qualifiedPackage = requestedName.slice(0, lastDot);
        const qualifiedName = requestedName.slice(lastDot + 1);
        return declares(catalog, qualifiedPackage, qualifiedName)
            ? { name: qualifiedName, package: qualifiedPackage, shadows: [] }
            : undefined;
    }

    const priority = effectivePackages(profile);
    const matches: string[] = [];
    for (let index = priority.length - 1; index >= 0; index--) {
        if (declares(catalog, priority[index], requestedName)) {
            matches.push(priority[index]);
        }
    }

    return matches.length === 0 ? undefined : { name: requestedName, package: matches[0], shadows: matches.slice(1) };
}

function declares(catalog: PackageCatalog, packageName: string, name: string): boolean {
    return catalog[packageName]?.includes(name) ?? false;
}
