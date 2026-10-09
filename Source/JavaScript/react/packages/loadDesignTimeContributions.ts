// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeBundle } from './DesignTimeBundle';
import { DesignTimeContractVersion } from './DesignTimeContractVersion';
import { DesignTimeExtensionPoint, designTimeExtensionPointLabels } from './DesignTimeExtensionPoint';
import { ScenePackageBundle } from './ScenePackageBundle';

/**
 * A package's design-time contributions as a host loaded them: only what the manifest declares, or nothing
 * with the reason when the package cannot be loaded at all.
 */
export interface LoadedDesignTimeContributions {
    contributions: Partial<Record<DesignTimeExtensionPoint, Record<string, unknown>>>;
    unavailableReason?: string;
}

/**
 * Loads the design-time contributions of approved bundles, checking each against the contract version this
 * host implements and against what its manifest declares. Nothing is partially trusted: a package with an
 * incompatible or unreadable contract version, or contributions its manifest does not declare at all,
 * contributes nothing; a single undeclared contribution is left out; a declared one the bundle lacks is
 * reported and falls back.
 */
export function loadDesignTimeContributions(
    bundles: ScenePackageBundle[],
    loadDesignTime: boolean,
): { packages: Map<string, LoadedDesignTimeContributions>; diagnostics: string[] } {
    const packages = new Map<string, LoadedDesignTimeContributions>();
    const diagnostics: string[] = [];
    const hostMajor = DesignTimeContractVersion.split('.')[0];

    for (const { manifest, designTime } of bundles) {
        const declared = manifest.designTime;
        const unavailable = (reason: string) => {
            diagnostics.push(reason);
            packages.set(manifest.name, { contributions: {}, unavailableReason: reason });
        };

        if (!declared && !designTime) continue;
        if (!loadDesignTime) {
            packages.set(manifest.name, { contributions: {}, unavailableReason: `This host does not load design-time contributions, so package '${manifest.name}' uses generic editors` });
            continue;
        }

        if (!declared) {
            unavailable(`Package '${manifest.name}' provides design-time contributions its manifest does not declare; none are loaded`);
            continue;
        }

        const version = declared.contractVersion ?? '1.0';
        if (!/^\d+\.\d+$/.test(version)) {
            unavailable(`Package '${manifest.name}' declares design-time contract version '${version}', which is not a major.minor version; none of its contributions are loaded`);
            continue;
        }

        if (version.split('.')[0] !== hostMajor) {
            unavailable(`Package '${manifest.name}' targets design-time contract ${version}, but this host implements ${DesignTimeContractVersion}; none of its contributions are loaded`);
            continue;
        }

        packages.set(manifest.name, { contributions: declaredContributions(manifest.name, declared, designTime, diagnostics) });
    }

    return { packages, diagnostics };
}

function declaredContributions(
    packageName: string,
    declared: Record<DesignTimeExtensionPoint, string[]>,
    provided: DesignTimeBundle | undefined,
    diagnostics: string[],
): LoadedDesignTimeContributions['contributions'] {
    const contributions: LoadedDesignTimeContributions['contributions'] = {};

    for (const point of Object.values(DesignTimeExtensionPoint)) {
        const label = designTimeExtensionPointLabels[point];
        const names = new Set(declared[point] ?? []);
        const available = (provided?.[point] ?? {}) as Record<string, unknown>;
        const loaded: Record<string, unknown> = {};

        for (const name of names) {
            if (name in available) {
                loaded[name] = available[name];
            } else {
                diagnostics.push(`Package '${packageName}' declares the ${label} '${name}', but its design-time bundle does not provide it`);
            }
        }

        for (const name of Object.keys(available).filter(name => !names.has(name))) {
            diagnostics.push(`Package '${packageName}' provides the ${label} '${name}', which its manifest does not declare; it is not loaded`);
        }

        contributions[point] = loaded;
    }

    return contributions;
}
