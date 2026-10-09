// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle, componentRegistryKey } from '@cratis/scene.react';
import { InspectionChecklist } from './InspectionChecklist';
import { generateChecklistItemsActionId, inspectionChecklistDescriptor } from './inspectionsDescriptors';
import { inspectionChecklistName, inspectionsPackageName } from './packageName';

/**
 * The package's declaration. The `designTime` block names every extension this package's optional design-time
 * bundle provides, and the contract version it was written against; it is data, so a host reads it without
 * loading any design-time code.
 */
export const inspectionsPackageManifest: ScenePackage = {
    name: inspectionsPackageName,
    version: '2.4.0',
    kind: PackageKind.ComponentLibrary,
    dependencies: [],
    components: [inspectionChecklistName],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
    displayName: 'Acme Inspections',
    description: 'Checklists for recording inspections, with a designer that generates items from the recording command.',
    module: '@acme/scene.inspections',
    license: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    designTime: {
        contractVersion: '1.0',
        previews: ['checklistPreview'],
        designers: ['checklistDesigner'],
        propertyEditors: ['checklistItems'],
        propertyDisplays: ['severityBadge'],
        actions: [generateChecklistItemsActionId],
    },
};

/**
 * The runtime bundle: the manifest, the component and its descriptor. It carries no design-time code, so a
 * runtime host that imports it never loads a designer.
 */
export const inspectionsPackage: ScenePackageBundle = {
    manifest: inspectionsPackageManifest,
    components: { [componentRegistryKey(inspectionsPackageName, inspectionChecklistName)]: InspectionChecklist },
    descriptors: [inspectionChecklistDescriptor],
};
