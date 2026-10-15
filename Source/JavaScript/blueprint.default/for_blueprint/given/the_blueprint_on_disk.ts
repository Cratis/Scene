// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { BlueprintCatalogFile, BlueprintSource, TemplateSource, describeBlueprintCatalog, toBlueprintCatalogFile, verifyBlueprintPackage } from '@cratis/scene.engine';
import { PackageKind, SampleDataPack } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';

/** The package root, two folders above this file. */
export const packageRoot = join(import.meta.dirname, '..', '..');

function filesUnder(folder: string): string[] {
    const absolute = join(packageRoot, folder);
    if (!existsSync(absolute)) return [];
    return readdirSync(absolute).flatMap(entry => {
        const path = join(absolute, entry);
        return statSync(path).isDirectory() ? filesUnder(relative(packageRoot, path)) : [relative(packageRoot, path).split('\\').join('/')];
    });
}

/**
 * A blueprint bundle with what a manifest only names read from the package on disk: the sample-data packs, and the files the package
 * ships (`thumbnails/`, `sampleData/`). The same list `npm pack` would carry for those folders, which `verify-blueprints.js` checks against
 * the real archive.
 */
export function blueprintOnDisk(bundle: ScenePackageBundle): BlueprintSource {
    const files = [...filesUnder('thumbnails'), ...filesUnder('sampleData')];
    const packs = (bundle.manifest.sampleData ?? []).filter(reference => files.includes(reference.path))
        .map(reference => JSON.parse(readFileSync(join(packageRoot, reference.path), 'utf-8')) as SampleDataPack);

    return { ...bundle, packs, files } as BlueprintSource;
}

/**
 * The component libraries the templates require, at the versions this repository ships them. Declared here rather than imported because
 * these packages do not depend on them; their versions are what the templates' compatibility ranges are checked against.
 */
const requiredPackage = (name: string, version: string): TemplateSource => ({
    manifest: { name, version, kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
});

/** The packages a blueprint's templates require, plus the other blueprints given: the library its templates are placed into. */
export const asLibrary = (...bundles: ScenePackageBundle[]): TemplateSource[] => [
    requiredPackage('PrimeReact', '11.1.0'), requiredPackage('Cratis.Components', '3.0.0'), ...(bundles as TemplateSource[]),
];

const catalogPath = join(packageRoot, 'blueprintCatalog.json');

/** The catalog this package declares (empty for a package that provides foundation templates and no domain). */
export const describedCatalog = (source: BlueprintSource): BlueprintCatalogFile => toBlueprintCatalogFile(describeBlueprintCatalog([source]));

/** Writes the package's catalog when `UPDATE_BLUEPRINT_CATALOG=1`, and returns what is on disk (undefined when the package ships none). */
export function catalogOnDisk(described: BlueprintCatalogFile): BlueprintCatalogFile | undefined {
    if (process.env.UPDATE_BLUEPRINT_CATALOG === '1' && described.blueprints.length > 0) writeFileSync(catalogPath, `${JSON.stringify(described, null, 2)}\n`);
    return existsSync(catalogPath) ? (JSON.parse(readFileSync(catalogPath, 'utf-8')) as BlueprintCatalogFile) : undefined;
}

export { verifyBlueprintPackage };
