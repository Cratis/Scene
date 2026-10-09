// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneEdit } from '@cratis/scene.model';
import { DesignTimeActionContext, PackageHostConfiguration, ScenePackageBundle } from '@cratis/scene.react';
import { inspectionChecklistDescriptor } from '../../inspectionsDescriptors';
import { inspectionChecklistComponent, inspectionsPackageName } from '../../packageName';

/** A host configuration that approves exactly the given bundles for a design-time session. */
export function designTimeConfiguration(bundles: ScenePackageBundle[], loadDesignTime = true): PackageHostConfiguration {
    return {
        bundles,
        profile: { name: 'studio', targetPlatform: 'web', packages: bundles.map(bundle => bundle.manifest.name) },
        policy: { allowExecutableImports: true, allowNetworkAssets: false, loadDesignTime },
    };
}

/** A checklist element as it sits in a document. */
export function aChecklist(properties: Record<string, unknown> = {}): ExternalComponent {
    return { id: 'checklist', componentName: inspectionChecklistComponent, properties, slots: {} } as unknown as ExternalComponent;
}

/** The generic context a host gives a design-time contribution, recording what the contribution submits. */
export function aDesignTimeContext(element: ExternalComponent, bundles: ScenePackageBundle[]) {
    const submittedEdits: SceneEdit[][] = [];
    const submittedActions: { actionId: string; edits: SceneEdit[] }[] = [];
    const context: DesignTimeActionContext = {
        element,
        root: element,
        descriptor: inspectionChecklistDescriptor,
        profile: { name: 'studio', targetPlatform: 'web', packages: [inspectionsPackageName] },
        bundles,
        permissions: { edit: true },
        capabilities: {},
        diagnostics: [],
        commandMetadata: { properties: [{ name: 'siteId', type: 'Guid' }, { name: 'fireExitsClear', type: 'Boolean', label: 'Fire exits are clear' }] },
        submitEdits: edits => submittedEdits.push(edits),
        submitAction: (actionId, edits) => submittedActions.push({ actionId, edits }),
    };

    return { context, submittedEdits, submittedActions };
}
