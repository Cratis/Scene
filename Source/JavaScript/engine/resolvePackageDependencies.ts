// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage } from '@cratis/scene.model';
import { MissingPackageDependency, PackageSelection, PackageVersionConflict } from './PackageSelection';
import { isVersionSatisfiedBy } from './packageVersionRange';

/**
 * Expands a chosen set of package names into the complete, correctly ordered list a {@link UiProfile}
 * needs — the runtime half. The C# twin in `Cratis.Scene.Engine` implements the same algorithm for
 * Studio's package picker and Stage's build; both are asserted against the same shared fixture corpus so
 * they cannot drift apart.
 *
 * This is a different concern from `resolveComponentName`, which resolves one component *name* against
 * an already-decided package list. This decides what that list is.
 *
 * Ordering is a stable topological sort: among packages whose dependencies are equally satisfied, the one
 * the caller named first comes first, and packages pulled in transitively follow in the order they were
 * discovered. When a cycle makes ordering impossible, the packages involved are reported in `cycles` and
 * appended in discovery order rather than dropped.
 */
export function resolvePackageDependencies(selected: string[], catalog: ScenePackage[]): PackageSelection {
    const index = new Map(catalog.map((scenePackage) => [scenePackage.name, scenePackage]));
    const discovered: string[] = [];
    const seen = new Set<string>(selected);
    const missing: MissingPackageDependency[] = [];
    const versionConflicts: PackageVersionConflict[] = [];

    const pending = [...selected];
    while (pending.length > 0) {
        const name = pending.shift()!;
        discovered.push(name);

        const scenePackage = index.get(name);
        if (!scenePackage) continue;

        for (const dependency of scenePackage.dependencies) {
            const dependedOn = index.get(dependency.name);
            if (!dependedOn) {
                missing.push({ package: scenePackage.name, dependsOn: dependency.name });
                continue;
            }

            if (!isVersionSatisfiedBy(dependedOn.version, dependency.versionRange)) {
                versionConflicts.push({
                    package: scenePackage.name,
                    dependsOn: dependency.name,
                    requiredRange: dependency.versionRange!,
                    actualVersion: dependedOn.version,
                });
            }

            if (!seen.has(dependency.name)) {
                seen.add(dependency.name);
                pending.push(dependency.name);
            }
        }
    }

    const cycles = findCycles(discovered, index);
    const packages = topologicallyOrder(discovered, index);
    const chosen = new Set(selected);

    return {
        packages,
        added: packages.filter((name) => !chosen.has(name)),
        missing,
        versionConflicts,
        cycles,
    };
}

function dependenciesWithin(name: string, index: Map<string, ScenePackage>, within: Set<string>): string[] {
    const scenePackage = index.get(name);
    if (!scenePackage) return [];
    const names = scenePackage.dependencies.map((dependency) => dependency.name).filter((dependency) => within.has(dependency));
    return [...new Set(names)];
}

/**
 * Orders an already-closed set of package names so each follows the packages it depends on.
 */
function topologicallyOrder(names: string[], index: Map<string, ScenePackage>): string[] {
    const within = new Set(names);
    const remaining = new Map(names.map((name) => [name, dependenciesWithin(name, index, within).length]));

    const ordered: string[] = [];
    const placed = new Set<string>();
    let progressed = true;
    while (progressed) {
        progressed = false;
        for (const name of names) {
            if (placed.has(name) || remaining.get(name) !== 0) continue;

            ordered.push(name);
            placed.add(name);
            progressed = true;

            for (const other of names) {
                if (placed.has(other)) continue;
                if (dependenciesWithin(other, index, within).includes(name)) {
                    remaining.set(other, remaining.get(other)! - 1);
                }
            }
        }
    }

    // Anything left is inside a cycle, or downstream of one. It is reported through `cycles`; keeping it
    // in the list means a package picker never silently loses a package it was told about.
    ordered.push(...names.filter((name) => !placed.has(name)));
    return ordered;
}

/**
 * Finds every dependency cycle, walking depth-first from each package in discovery order so the result
 * is deterministic. A cycle is recorded once, keyed by the set of packages in it.
 */
function findCycles(names: string[], index: Map<string, ScenePackage>): string[][] {
    const within = new Set(names);
    const cycles: string[][] = [];
    const recorded = new Set<string>();
    const path: string[] = [];
    const onPath = new Set<string>();
    const explored = new Set<string>();

    const walk = (name: string) => {
        if (onPath.has(name)) {
            const cycle = path.slice(path.indexOf(name));
            const key = [...cycle].sort().join(' ');
            if (!recorded.has(key)) {
                recorded.add(key);
                cycles.push(cycle);
            }

            return;
        }

        if (explored.has(name)) return;
        explored.add(name);

        path.push(name);
        onPath.add(name);
        for (const dependency of dependenciesWithin(name, index, within)) {
            walk(dependency);
        }

        onPath.delete(name);
        path.pop();
    };

    for (const name of names) {
        walk(name);
    }

    return cycles;
}
