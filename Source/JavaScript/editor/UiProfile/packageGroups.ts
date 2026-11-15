// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { PackageGroup } from './PackageGroup';
import { PackageGroupId } from './PackageGroupId';

/**
 * The package groups, as data: the Packages pane, the Using summary and the Resolution pane all render
 * from this list, so a new kind of package is one entry here and one label set in the strings.
 *
 * Icon libraries (Cratis/StudioIssues#397) are one more entry here: they are ordinary explicit packages of
 * Scene's icon-library kind, so choosing, removing and automatic inclusion work as for any other group.
 */
export const packageGroups: PackageGroup[] = [
    { id: PackageGroupId.ComponentLibraries, includes: scenePackage => scenePackage.kind === PackageKind.ComponentLibrary },
    { id: PackageGroupId.Styling, includes: scenePackage => scenePackage.kind === PackageKind.Styling },
    { id: PackageGroupId.IconLibraries, includes: scenePackage => scenePackage.kind === PackageKind.IconLibrary },
    { id: PackageGroupId.Blueprints, includes: scenePackage => scenePackage.kind === PackageKind.Blueprint },
];
