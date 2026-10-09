// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { PackageHostAssets } from './PackageHostAssets';
import { PackageHostConfiguration, resolvePackageHost } from './PackageHostConfiguration';
import { PackageHostRenderMode } from './PackageHostRenderMode';

export interface PackageHostViewProps {
    configuration: PackageHostConfiguration;
    element: SceneElement;
    mode?: PackageHostRenderMode;
    dataContext?: unknown;
    queryResults?: Record<string, unknown>;
    componentOutputs?: Record<string, Record<string, unknown>>;
}

/**
 * Renders a Scene element through an approved package host. Diagnostics are blocking: no rejected bundle,
 * component, asset or design-time contribution is rendered after policy/dependency validation fails.
 */
export function PackageHostView({
    configuration,
    element,
    mode = PackageHostRenderMode.Embedded,
    dataContext,
    queryResults,
    componentOutputs,
}: PackageHostViewProps) {
    const host = resolvePackageHost(configuration);
    if (host.blocked) {
        return <section role='alert' data-scene-host-mode={mode} data-scene-host-blocked='true'>
            <h2>Scene package host blocked rendering</h2>
            <ul>{host.diagnostics.map(diagnostic => <li key={diagnostic}>{diagnostic}</li>)}</ul>
        </section>;
    }

    return <section data-scene-host-mode={mode} data-scene-host-blocked='false'>
        <PackageHostAssets assets={host.assets} fonts={host.fonts} />
        <SceneElementView element={element} registry={host.components} dataContext={dataContext} queryResults={queryResults} componentOutputs={componentOutputs} />
    </section>;
}
