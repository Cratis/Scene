// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A dependency a selected package declares that nothing in the catalog can satisfy — so it cannot be
 * pulled in automatically, and the selection is genuinely incomplete rather than merely under-specified.
 */
export interface MissingPackageDependency {
    /**
     * The package that declares the dependency.
     */
    package: string;

    /**
     * The name of the package it depends on, which the catalog does not contain.
     */
    dependsOn: string;
}

/**
 * A dependency that resolved to a package the catalog does contain, but at a version its declared range
 * does not accept.
 */
export interface PackageVersionConflict {
    /**
     * The package that declares the dependency.
     */
    package: string;

    /**
     * The name of the package it depends on.
     */
    dependsOn: string;

    /**
     * The range the declaring package asked for.
     */
    requiredRange: string;

    /**
     * The version the catalog actually offers.
     */
    actualVersion: string;
}

/**
 * The outcome of expanding a chosen set of package names into the full set a {@link UiProfile} actually
 * needs.
 */
export interface PackageSelection {
    /**
     * Every package the selection requires, in ascending override-priority order: a package always
     * appears after the packages it depends on, so a package that layers on top of another shadows it on
     * a name collision. That is the order a profile's `packages` list should carry.
     */
    packages: string[];

    /**
     * The packages pulled in transitively that the caller did not choose — what a package picker tells
     * the user it is about to add on their behalf.
     */
    added: string[];

    /**
     * Dependencies nothing in the catalog can satisfy.
     */
    missing: MissingPackageDependency[];

    /**
     * Dependencies satisfied by name but not by version.
     */
    versionConflicts: PackageVersionConflict[];

    /**
     * Dependency cycles found while ordering, each listed as the packages involved. A cycle has no valid
     * priority order, so its members are emitted in discovery order and reported here rather than
     * silently arranged into one.
     */
    cycles: string[][];
}

/**
 * Whether a selection is complete and orderable — nothing missing, no version conflict, no cycle.
 */
export function isPackageSelectionValid(selection: PackageSelection): boolean {
    return selection.missing.length === 0 && selection.versionConflicts.length === 0 && selection.cycles.length === 0;
}
