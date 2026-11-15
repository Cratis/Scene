// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSystem, DialogTemplate, Layout, ScreenTemplate, Theme, UiProfile } from '@cratis/scene.model';
import { DesignLinking, ResolvedDesign, TemplateCatalogEntry, describeTemplateCatalog, incompatiblePackages, linkDesignSystem, resolveDesign, resolvePackageDependencies } from '@cratis/scene.engine';
import { IconAdapterRegistry, createIconAdapterRegistry } from '../icons/IconAdapterRegistry';
import { ScenePackageBundle, mergePackageRegistries, validatePackageBundle } from './ScenePackageBundle';
import { isNetworkAsset } from './isNetworkAsset';

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

    /** Whether the system is in dark mode; decides a profile's `System` colour scheme. Absent means light. */
    systemIsDark?: boolean;
}

export interface ResolvedPackageHost {
    bundles: ScenePackageBundle[];
    components: ReturnType<typeof mergePackageRegistries>;
    layouts: Layout[];
    screenTemplates: ScreenTemplate[];
    dialogTemplates: DialogTemplate[];
    themes: Theme[];

    /** The layout the UI profile names, from the approved packages. Absent when the profile names none. */
    layout?: Layout;

    /** The theme the UI profile names, from the approved packages. Absent when the profile names none. */
    theme?: Theme;

    /**
     * Every template the approved packages provide, with compatibility, attribution and license metadata and
     * whether it can be used with this package set. Template browsers read this rather than the raw lists.
     */
    templates: TemplateCatalogEntry[];

    /** Every design system the approved packages ship. */
    designSystems: DesignSystem[];

    /**
     * The design system the profile is drawn from: the one the profile carries, else the last one an approved package ships. Absent when
     * neither exists, in which case the packages' own fallbacks apply.
     */
    designSystem?: DesignSystem;

    /** The design resolved for the profile's theme, colour scheme, accent, corners and font. Absent without a design system. */
    design?: ResolvedDesign;

    /** How the design system's components link to the components of the approved packages. Absent without a design system. */
    designLinking?: DesignLinking;

    /**
     * Everything about the design that could not be honoured, ready to show: a theme that is not found, a part a package cannot render, a
     * component nobody draws. Never silent (invariant I6) and never blocking - the host still renders, as well as it can.
     */
    designDiagnostics: string[];
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
        const networkAssets = packageAssets.filter(isNetworkAsset);
        if (!configuration.policy.allowNetworkAssets && networkAssets.length > 0) {
            diagnostics.push(`Package '${packageName}' declares network assets (${networkAssets.join(', ')}), but host policy forbids them`);
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

    const layouts = bundles.flatMap(bundle => bundle.layouts ?? []);
    const themes = bundles.flatMap(bundle => bundle.themes ?? []);
    const layout = configuration.profile.layout ? layouts.find(candidate => candidate.name === configuration.profile.layout) : undefined;
    const theme = configuration.profile.theme ? themes.find(candidate => candidate.name === configuration.profile.theme) : undefined;
    if (configuration.profile.layout && !layout) {
        diagnostics.push(`UI profile '${configuration.profile.name}' uses layout '${configuration.profile.layout}', which no approved package provides`);
    }
    if (configuration.profile.theme && !theme) {
        diagnostics.push(`UI profile '${configuration.profile.name}' uses theme '${configuration.profile.theme}', which no approved package provides`);
    } else if (theme && incompatiblePackages(theme, configuration.profile).length > 0) {
        diagnostics.push(`Theme '${theme.name}' is not compatible with ${incompatiblePackages(theme, configuration.profile).join(', ')} in UI profile '${configuration.profile.name}'`);
    }

    const designSystems = bundles.flatMap(bundle => bundle.designSystems ?? []);
    const designSystem = configuration.profile.designSystem ?? designSystems[designSystems.length - 1];
    let design: ResolvedDesign | undefined;
    let designLinking: DesignLinking | undefined;
    const designDiagnostics: string[] = [];
    if (designSystem !== undefined) {
        design = resolveDesign({
            designSystem,
            theme: configuration.profile.theme,
            packageThemes: themes,
            appearance: configuration.profile.appearance,
            systemIsDark: configuration.systemIsDark,
        });
        designDiagnostics.push(...design.diagnostics.map(diagnostic => diagnostic.message), ...design.appearance.diagnostics.map(diagnostic => diagnostic.message));

        const catalog = Object.fromEntries(bundles.map(bundle => [bundle.manifest.name, bundle.manifest.components]));
        designLinking = linkDesignSystem(designSystem, configuration.profile, catalog, bundles.flatMap(bundle => bundle.descriptors ?? []));
        designDiagnostics.push(...designLinking.diagnostics.map(diagnostic => diagnostic.message));
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
        layout: blocked ? undefined : layout,
        theme: blocked ? undefined : theme,
        templates: describeTemplateCatalog(approved, configuration.sceneVersion),
        designSystems: approved.flatMap(bundle => bundle.designSystems ?? []),
        designSystem: blocked ? undefined : designSystem,
        design: blocked ? undefined : design,
        designLinking: blocked ? undefined : designLinking,
        designDiagnostics: blocked ? [] : designDiagnostics,
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
