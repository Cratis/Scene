// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Layout, ScreenTemplate, Theme, UiProfile } from '@cratis/scene.model';
import { TemplateCatalogEntry, describeTemplateCatalog, resolvePackageDependencies } from '@cratis/scene.engine';
import { IconAdapterRegistry, createIconAdapterRegistry } from '../icons/IconAdapterRegistry';
import { ScenePackageBundle, mergePackageRegistries, validatePackageBundle } from './ScenePackageBundle';

export interface PackageHostPolicy {
    allowExecutableImports: boolean;
    allowNetworkAssets: boolean;

    /** Whether this host is resolving optional design-time bundles in addition to runtime contributions. */
    loadDesignTime?: boolean;
}

export interface PackageHostConfiguration {
    bundles: ScenePackageBundle[];
    profile: UiProfile;
    policy: PackageHostPolicy;

    /** The Scene version the host runs, checked against each template's compatibility range when given. */
    sceneVersion?: string;
}

export interface ResolvedPackageHost {
    bundles: ScenePackageBundle[];
    components: ReturnType<typeof mergePackageRegistries>;
    layouts: Layout[];
    screenTemplates: ScreenTemplate[];
    dialogTemplates: DialogTemplate[];
    themes: Theme[];

    /**
     * Every template the approved packages provide, with compatibility, attribution and license metadata and
     * whether it can be used with this package set. Template browsers read this rather than the raw lists.
     */
    templates: TemplateCatalogEntry[];
    icons: IconAdapterRegistry;
    assets: string[];
    fonts: string[];
    blocked: boolean;
    diagnostics: string[];
}

/**
 * Resolves the approved package set a standalone or embedded React host uses.
 */
export function resolvePackageHost(configuration: PackageHostConfiguration): ResolvedPackageHost {
    const diagnostics: string[] = [];
    const names = new Map<string, number>();
    for (const bundle of configuration.bundles) {
        names.set(bundle.manifest.name, (names.get(bundle.manifest.name) ?? 0) + 1);
    }

    for (const [name, count] of names) {
        if (count > 1) diagnostics.push(`Package '${name}' is approved more than once; duplicate bundles are ambiguous`);
    }

    const byName = new Map(configuration.bundles.map(bundle => [bundle.manifest.name, bundle]));
    const selection = resolvePackageDependencies(configuration.profile.packages, configuration.bundles.map(bundle => bundle.manifest));
    for (const missing of selection.missing) diagnostics.push(`Package '${missing.package}' depends on missing package '${missing.dependsOn}'`);
    for (const conflict of selection.versionConflicts) {
        diagnostics.push(`Package '${conflict.package}' requires '${conflict.dependsOn}' ${conflict.requiredRange} but approved version is ${conflict.actualVersion}`);
    }
    for (const cycle of selection.cycles) diagnostics.push(`Package dependency cycle: ${cycle.join(' -> ')}`);

    const bundles: ScenePackageBundle[] = [];
    const runtimeSingletons = new Map<string, string>();
    const assets: string[] = [];

    for (const packageName of selection.packages) {
        const bundle = byName.get(packageName);
        if (!bundle) {
            diagnostics.push(`UI profile asks for '${packageName}' but the host did not approve a bundle for it`);
            continue;
        }

        diagnostics.push(...validatePackageBundle(bundle).map(problem => `${packageName}: ${problem}`));
        if (configuration.policy.loadDesignTime === true && !configuration.policy.allowExecutableImports && bundle.designTime) {
            diagnostics.push(`Package '${packageName}' provides executable design-time contributions, but host policy forbids them`);
        }

        const packageAssets = bundle.manifest.assets ?? [];
        if (!configuration.policy.allowNetworkAssets && packageAssets.some(asset => /^https?:\/\//.test(asset))) {
            diagnostics.push(`Package '${packageName}' declares network assets, but host policy forbids them`);
        }
        assets.push(...packageAssets);

        for (const dependency of bundle.manifest.runtimeSingletons ?? []) {
            const owner = runtimeSingletons.get(dependency);
            if (owner && owner !== packageName) {
                diagnostics.push(`Runtime singleton '${dependency}' is provided by both '${owner}' and '${packageName}'`);
            }
            runtimeSingletons.set(dependency, packageName);
        }

        bundles.push(bundle);
    }

    const blocked = diagnostics.length > 0;
    const approved = blocked ? [] : bundles;
    const approvedAssets = blocked ? [] : assets;

    return {
        bundles: approved,
        components: mergePackageRegistries(approved),
        layouts: approved.flatMap(bundle => bundle.layouts ?? []),
        screenTemplates: approved.flatMap(bundle => bundle.screenTemplates ?? []),
        dialogTemplates: approved.flatMap(bundle => bundle.dialogTemplates ?? []),
        themes: approved.flatMap(bundle => bundle.themes ?? []),
        templates: describeTemplateCatalog(approved, configuration.sceneVersion),
        icons: createIconAdapterRegistry(approved.map(bundle => bundle.iconLibrary?.adapter).filter(adapter => adapter !== undefined)),
        assets: approvedAssets,
        fonts: approvedAssets.filter(isFontAsset),
        blocked,
        diagnostics,
    };
}

function isFontAsset(asset: string): boolean {
    return /\.(woff2?|otf|ttf)(\?|$)/.test(asset) || asset.includes('/fonts/');
}
