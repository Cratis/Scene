// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ScenePackageBundle, mergePackageRegistries } from './ScenePackageBundle';

export interface PackageHostPolicy {
    allowExecutableImports: boolean;
    allowNetworkAssets: boolean;
}

export interface PackageHostConfiguration {
    bundles: ScenePackageBundle[];
    profile: UiProfile;
    policy: PackageHostPolicy;
}

export interface ResolvedPackageHost {
    bundles: ScenePackageBundle[];
    components: ReturnType<typeof mergePackageRegistries>;
    diagnostics: string[];
}

/**
 * Resolves the approved package set a standalone or embedded React host uses.
 */
export function resolvePackageHost(configuration: PackageHostConfiguration): ResolvedPackageHost {
    const diagnostics: string[] = [];
    const byName = new Map(configuration.bundles.map(bundle => [bundle.manifest.name, bundle]));
    const bundles: ScenePackageBundle[] = [];
    const runtimeSingletons = new Map<string, string>();

    for (const packageName of configuration.profile.packages) {
        const bundle = byName.get(packageName);
        if (!bundle) {
            diagnostics.push(`UI profile asks for '${packageName}' but the host did not approve a bundle for it`);
            continue;
        }

        if (!configuration.policy.allowNetworkAssets && (bundle.manifest.assets ?? []).some(asset => /^https?:\/\//.test(asset))) {
            diagnostics.push(`Package '${packageName}' declares network assets, but host policy forbids them`);
        }

        for (const dependency of bundle.manifest.runtimeSingletons ?? []) {
            const owner = runtimeSingletons.get(dependency);
            if (owner && owner !== packageName) {
                diagnostics.push(`Runtime singleton '${dependency}' is provided by both '${owner}' and '${packageName}'`);
            }
            runtimeSingletons.set(dependency, packageName);
        }

        bundles.push(bundle);
    }

    return { bundles, components: mergePackageRegistries(bundles), diagnostics };
}
