// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage, TemplateMetadata } from '@cratis/scene.model';
import { TemplateCatalogKind } from '@cratis/scene.engine';
import { resolvePackageHost } from '../packages/PackageHostConfiguration';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';

const provenance: TemplateMetadata = {
    compatibility: { scene: '^4.13.0', packages: [{ name: 'Base', versionRange: '^2.0.0' }] },
    attribution: { author: 'Acme', url: 'https://acme.example/templates' },
    license: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
};

const manifest = (name: string, version: string, overrides: Partial<ScenePackage> = {}): ScenePackage => ({
    name, version, kind: PackageKind.Blueprint, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [], ...overrides,
});

const bundles: ScenePackageBundle[] = [
    { manifest: manifest('Base', '2.1.0'), components: {} },
    {
        manifest: manifest('Acme.Blueprint', '1.0.0', { dependencies: [{ name: 'Base' }], screenTemplates: ['Orders', 'Unlicensed'] }),
        components: {},
        screenTemplates: [
            { name: 'Orders', slots: [], displayName: 'Orders', metadata: { ...provenance, type: 'List', category: 'Sales' } },
            { name: 'Unlicensed', slots: [], metadata: { compatibility: provenance.compatibility, attribution: provenance.attribution } },
        ],
    },
];

describe('when describing the approved template catalog', () => {
    const host = resolvePackageHost({
        profile: { name: 'web', targetPlatform: 'web', packages: ['Acme.Blueprint'] },
        policy: { allowExecutableImports: false, allowNetworkAssets: false },
        bundles,
        sceneVersion: '4.13.0',
    });

    it('should approve the package set', () => host.diagnostics.should.be.empty);

    it('should surface compatibility, attribution and license for every template', () => {
        const orders = host.templates.find(entry => entry.name === 'Orders')!;
        orders.should.include({ package: 'Acme.Blueprint', packageVersion: '1.0.0', kind: TemplateCatalogKind.ScreenTemplate, category: 'Sales', compatible: true });
        orders.license!.should.equal('Apache-2.0');
        orders.attribution!.should.deep.equal(provenance.attribution);
        orders.compatibility!.should.deep.equal(provenance.compatibility);
    });

    it('should mark a template without a license as unusable instead of hiding it', () => {
        const unlicensed = host.templates.find(entry => entry.name === 'Unlicensed')!;
        unlicensed.compatible.should.be.false;
        unlicensed.problems.should.deep.equal(["Template 'Unlicensed' declares no license"]);
    });

    it('should describe no templates when the host is blocked', () => {
        resolvePackageHost({
            profile: { name: 'web', targetPlatform: 'web', packages: ['Acme.Blueprint'] },
            policy: { allowExecutableImports: false, allowNetworkAssets: false },
            bundles: [bundles[1]],
        }).templates.should.be.empty;
    });
});
