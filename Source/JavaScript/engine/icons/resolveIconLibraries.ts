// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { resolvePackageDependencies } from '../resolvePackageDependencies';
import { IconDiagnostic } from './IconDiagnostic';
import { IconLibraryResolution } from './IconLibraryResolution';

/**
 * Finds the icon libraries a profile's packages make active - the ones it lists and the ones its other
 * packages declare a dependency on - through the normal package resolver, so an icon library is
 * selected, ordered and version-checked exactly as any other package is.
 *
 * Several libraries coexist. Nothing here ranks them: two libraries that both ship `home` stay two
 * different icons, told apart by the library in their {@link IconReference}.
 *
 * @param selected The package names the profile lists.
 * @param catalog Every package that could be selected.
 */
export function resolveIconLibraries(selected: string[], catalog: ScenePackage[]): IconLibraryResolution {
    const selection = resolvePackageDependencies(selected, catalog);
    const index = new Map(catalog.map((scenePackage) => [scenePackage.name, scenePackage]));
    const chosen = new Set(selected);
    const active = selection.packages.map((name) => index.get(name)).filter((scenePackage): scenePackage is ScenePackage => scenePackage !== undefined);

    const libraries = active
        .filter((scenePackage) => scenePackage.kind === PackageKind.IconLibrary)
        .map((scenePackage) => ({
            library: scenePackage.name,
            package: scenePackage,
            isSelected: chosen.has(scenePackage.name),
            requiredBy: active
                .filter((other) => other.dependencies.some((dependency) => dependency.name === scenePackage.name))
                .map((other) => other.name),
        }));

    const libraryNames = new Set(libraries.map((resolved) => resolved.library));
    const diagnostics: IconDiagnostic[] = selection.versionConflicts
        .filter((conflict) => libraryNames.has(conflict.dependsOn))
        .map((conflict) => ({
            kind: 'incompatible-version',
            library: conflict.dependsOn,
            message: `'${conflict.package}' needs the icon library '${conflict.dependsOn}' at '${conflict.requiredRange}', but version ${conflict.actualVersion} is what is available`,
        }));

    return { libraries, diagnostics };
}
