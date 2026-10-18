// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { BlueprintCatalogFile, BlueprintSource, TemplateSource, describeBlueprintCatalog, toBlueprintCatalogFile, verifyBlueprintPackage } from '@cratis/scene.engine';
import { PackageKind, SampleDataPack } from '@cratis/scene.model';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { workOrdersBlueprint } from '../blueprint';

const root = join(import.meta.dirname, '..');
const filesUnder = (folder: string): string[] => {
    const absolute = join(root, folder);
    return !existsSync(absolute) ? [] : readdirSync(absolute).flatMap(entry => {
        const path = join(absolute, entry);
        return statSync(path).isDirectory() ? filesUnder(relative(root, path)) : [relative(root, path).split('\\').join('/')];
    });
};
const requiredPackage = (name: string, version: string): TemplateSource => ({
    manifest: { name, version, kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
});

// The definition of done for a domain blueprint (spec Part B 6): valid manifest and screen set, every template with complete metadata, a
// type, a Business / <domain> category and a thumbnail, every template placed by the slot resolver, sample data present and locale-tagged,
// and a dependency on the foundation set. The C# engine reports the same problems (BlueprintVerification.Verify).
describe('when verifying the Work orders blueprint', () => {
    const files = [...filesUnder('thumbnails'), ...filesUnder('sampleData')];
    const packs = (workOrdersBlueprint.manifest.sampleData ?? []).map(reference => JSON.parse(readFileSync(join(root, reference.path), 'utf-8')) as SampleDataPack);
    const source = { ...workOrdersBlueprint, packs, files } as BlueprintSource;
    const library = [requiredPackage('PrimeReact', '11.1.0'), requiredPackage('Cratis.Components', '3.0.0'), defaultBlueprint as TemplateSource];

    it('should be done', () => verifyBlueprintPackage(source, library, { requireBlueprintMetadata: true }).should.deep.equal([]));

    it('should keep its catalog current', () => {
        const described: BlueprintCatalogFile = toBlueprintCatalogFile(describeBlueprintCatalog([source]));
        const path = join(root, 'blueprintCatalog.json');
        if (process.env.UPDATE_BLUEPRINT_CATALOG === '1') writeFileSync(path, `${JSON.stringify(described, null, 2)}\n`);
        (existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : undefined).should.deep.equal(described);
    });
});
