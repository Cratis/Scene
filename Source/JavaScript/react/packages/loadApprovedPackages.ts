// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApprovedPackageSet } from './ApprovedPackageSet';
import { PackageHostConfiguration, ResolvedPackageHost, resolvePackageHost } from './PackageHostConfiguration';
import { ScenePackageBundle } from './ScenePackageBundle';

/**
 * How a host loads the modules of an approved package set: one loader per npm package name the set may import.
 *
 * A bundler resolves imports at build time, so the host lists them as literal `import()` calls
 * (`{ '@acme/scene.charts': () => import('@acme/scene.charts') }`). A set naming a module the host's build does
 * not include is a diagnostic, never an attempt to load an arbitrary specifier.
 */
export type ApprovedPackageImporters = Record<string, () => Promise<Record<string, unknown>>>;

/** The outcome of loading an approved package set. */
export interface LoadedApprovedPackages {
    /** The bundles that loaded and match what the set declared, in ordinal package-name order. */
    bundles: ScenePackageBundle[];

    /** Every reason a package was not loaded or does not match its declaration. */
    diagnostics: string[];
}

/**
 * Loads the runtime bundles of an approved package set through the host's importers.
 *
 * Nothing executes unless the host's policy allows executable imports. A package whose module cannot be imported,
 * lacks its declared export, or whose bundle manifest differs from the declaration (name, version, components,
 * layouts, templates, themes) contributes nothing and is reported - the declaration planning used and the code
 * running must be the same package. Packages load in ordinal name order, so the result does not depend on the
 * order the set was written in.
 */
export async function loadApprovedPackages(
    set: ApprovedPackageSet,
    importers: ApprovedPackageImporters,
    policy: { allowExecutableImports: boolean },
): Promise<LoadedApprovedPackages> {
    const bundles: ScenePackageBundle[] = [];
    const diagnostics: string[] = [];
    const ordered = [...set.packages].sort((a, b) => (a.manifest.name < b.manifest.name ? -1 : a.manifest.name > b.manifest.name ? 1 : 0));

    for (const { manifest, module } of ordered) {
        const label = `Package '${manifest.name}'`;
        if (!policy.allowExecutableImports) {
            diagnostics.push(`${label} brings executable code from '${module.npm}', but host policy forbids executable imports`);
            continue;
        }

        const importer = Object.prototype.hasOwnProperty.call(importers, module.npm) ? importers[module.npm] : undefined;
        if (!importer) {
            diagnostics.push(`${label} is imported from '${module.npm}', which this host's build does not include`);
            continue;
        }

        let loaded: Record<string, unknown>;
        try {
            loaded = await importer();
        } catch (error) {
            diagnostics.push(`${label} could not be loaded from '${module.npm}': ${error instanceof Error ? error.message : String(error)}`);
            continue;
        }

        const bundle = loaded[module.export] as ScenePackageBundle | undefined;
        if (!bundle || typeof bundle !== 'object' || !bundle.manifest || !bundle.components) {
            diagnostics.push(`${label} expects '${module.npm}' to export a package bundle named '${module.export}', which it does not`);
            continue;
        }

        const mismatches = declarationMismatches(manifest, bundle);
        if (mismatches.length > 0) {
            diagnostics.push(...mismatches.map(mismatch => `${label} does not match the bundle '${module.export}' of '${module.npm}': ${mismatch}`));
            continue;
        }

        bundles.push(bundle);
    }

    return { bundles, diagnostics };
}

function declarationMismatches(declared: ApprovedPackageSet['packages'][number]['manifest'], bundle: ScenePackageBundle): string[] {
    const actual = bundle.manifest;
    const mismatches: string[] = [];
    if (actual.name !== declared.name) mismatches.push(`the bundle is named '${actual.name}'`);
    if (actual.version !== declared.version) mismatches.push(`the set declares version ${declared.version} but the bundle is ${actual.version}`);
    if (actual.kind !== declared.kind) mismatches.push(`the set declares kind ${declared.kind} but the bundle is ${actual.kind}`);

    const lists = ['components', 'layouts', 'screenTemplates', 'dialogTemplates', 'themes'] as const;
    for (const list of lists) {
        const expected = [...(declared[list] ?? [])].sort();
        const found = [...(actual[list] ?? [])].sort();
        if (expected.join('\u0000') !== found.join('\u0000')) {
            mismatches.push(`the set declares ${list} [${expected.join(', ')}] but the bundle declares [${found.join(', ')}]`);
        }
    }

    return mismatches;
}

/** An approved package set and the importers that load it, resolved together with the built-in bundles. */
export interface ApprovedPackageHostConfiguration extends Omit<PackageHostConfiguration, 'bundles'> {
    /** The bundles the host ships. */
    bundles: ScenePackageBundle[];

    /** The custom packages the host approved. */
    packageSet: ApprovedPackageSet;

    /** The importers for the set's modules. */
    importers: ApprovedPackageImporters;
}

/**
 * Loads the approved package set and resolves the effective profile over the built-in and approved bundles in one
 * step. Packages that failed to load are reported in the result's `diagnostics` and block the host, so a profile
 * is never rendered with a silently missing package.
 */
export async function resolveApprovedPackageHost(configuration: ApprovedPackageHostConfiguration): Promise<ResolvedPackageHost> {
    const { packageSet, importers, ...rest } = configuration;
    const loaded = await loadApprovedPackages(packageSet, importers, configuration.policy);
    const host = resolvePackageHost({ ...rest, bundles: [...configuration.bundles, ...loaded.bundles] });
    if (loaded.diagnostics.length === 0) {
        return host;
    }

    return {
        ...host,
        bundles: [],
        components: {},
        layouts: [],
        screenTemplates: [],
        dialogTemplates: [],
        themes: [],
        layout: undefined,
        theme: undefined,
        templates: [],
        assets: [],
        fonts: [],
        blocked: true,
        diagnostics: [...loaded.diagnostics, ...host.diagnostics],
    };
}
