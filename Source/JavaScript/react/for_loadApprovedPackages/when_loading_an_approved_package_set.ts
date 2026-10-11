// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ApprovedPackage, ApprovedPackageSet } from '../packages/ApprovedPackageSet';
import { loadApprovedPackages, resolveApprovedPackageHost } from '../packages/loadApprovedPackages';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';

const manifest = (name: string, components: string[] = ['chart'], version = '1.0.0'): ScenePackage => ({
    name, version, kind: PackageKind.ComponentLibrary, dependencies: [], components, layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
});

const bundleOf = (name: string, components: string[] = ['chart'], version = '1.0.0'): ScenePackageBundle => ({
    manifest: manifest(name, components, version),
    components: Object.fromEntries(components.map(component => [`${name}:${component}`, () => null])) as ScenePackageBundle['components'],
});

const approved = (name: string, npm: string, exportName: string, components: string[] = ['chart']): ApprovedPackage => ({
    manifest: manifest(name, components), module: { npm, version: '1.0.0', export: exportName },
});

const setOf = (...packages: ApprovedPackage[]): ApprovedPackageSet => ({ version: 1, packages });
const open = { allowExecutableImports: true, allowNetworkAssets: false };

describe('when loading an approved package set', () => {
    it('should load each bundle through the importer for its npm package, in ordinal name order', async () => {
        const result = await loadApprovedPackages(
            setOf(approved('Zeta.Kit', '@zeta/kit', 'zeta'), approved('Acme.Charts', '@acme/charts', 'acme')),
            { '@zeta/kit': async () => ({ zeta: bundleOf('Zeta.Kit') }), '@acme/charts': async () => ({ acme: bundleOf('Acme.Charts') }) },
            open,
        );

        result.diagnostics.should.deep.equal([]);
        result.bundles.map(bundle => bundle.manifest.name).should.deep.equal(['Acme.Charts', 'Zeta.Kit']);
    });

    it('should not import anything when the policy forbids executable imports', async () => {
        let imported = false;
        const result = await loadApprovedPackages(setOf(approved('Acme.Charts', '@acme/charts', 'acme')), { '@acme/charts': async () => { imported = true; return { acme: bundleOf('Acme.Charts') }; } }, { allowExecutableImports: false });

        imported.should.equal(false);
        result.bundles.should.deep.equal([]);
        result.diagnostics.should.deep.equal(["Package 'Acme.Charts' brings executable code from '@acme/charts', but host policy forbids executable imports"]);
    });

    it('should report a module the host build does not include, without trying to load it', async () => {
        const result = await loadApprovedPackages(setOf(approved('Acme.Charts', '@acme/charts', 'acme')), {}, open);

        result.diagnostics.should.deep.equal(["Package 'Acme.Charts' is imported from '@acme/charts', which this host's build does not include"]);
    });

    it('should not treat inherited object members as importers', async () => {
        const result = await loadApprovedPackages(setOf(approved('Acme.Charts', 'constructor', 'acme')), {}, open);

        result.bundles.should.deep.equal([]);
    });

    it('should report a module that fails to import', async () => {
        const result = await loadApprovedPackages(setOf(approved('Acme.Charts', '@acme/charts', 'acme')), { '@acme/charts': async () => { throw new Error('Cannot find module'); } }, open);

        result.diagnostics.should.deep.equal(["Package 'Acme.Charts' could not be loaded from '@acme/charts': Cannot find module"]);
    });

    it('should report a missing export', async () => {
        const result = await loadApprovedPackages(setOf(approved('Acme.Charts', '@acme/charts', 'acme')), { '@acme/charts': async () => ({ other: bundleOf('Acme.Charts') }) }, open);

        result.diagnostics.should.deep.equal(["Package 'Acme.Charts' expects '@acme/charts' to export a package bundle named 'acme', which it does not"]);
    });

    it('should refuse a bundle that differs from the declaration', async () => {
        const result = await loadApprovedPackages(
            setOf(approved('Acme.Charts', '@acme/charts', 'acme', ['chart', 'spark'])),
            { '@acme/charts': async () => ({ acme: bundleOf('Acme.Charts', ['chart'], '2.0.0') }) },
            open,
        );

        result.bundles.should.deep.equal([]);
        result.diagnostics.should.deep.equal([
            "Package 'Acme.Charts' does not match the bundle 'acme' of '@acme/charts': the set declares version 1.0.0 but the bundle is 2.0.0",
            "Package 'Acme.Charts' does not match the bundle 'acme' of '@acme/charts': the set declares components [chart, spark] but the bundle declares [chart]",
        ]);
    });
});

describe('when resolving an approved package host', () => {
    const profile = { name: 'p', targetPlatform: 'web', packages: ['Acme.Charts'] };

    it('should resolve the profile over the built-in and approved bundles', async () => {
        const host = await resolveApprovedPackageHost({
            profile, bundles: [], policy: open, packageSet: setOf(approved('Acme.Charts', '@acme/charts', 'acme')),
            importers: { '@acme/charts': async () => ({ acme: bundleOf('Acme.Charts') }) },
        });

        host.blocked.should.equal(false);
        Object.keys(host.components).should.deep.equal(['Acme.Charts:chart']);
    });

    it('should block the host, naming what failed, when an approved package cannot load', async () => {
        const host = await resolveApprovedPackageHost({ profile, bundles: [], policy: open, packageSet: setOf(approved('Acme.Charts', '@acme/charts', 'acme')), importers: {} });

        host.blocked.should.equal(true);
        host.components.should.deep.equal({});
        host.diagnostics[0].should.equal("Package 'Acme.Charts' is imported from '@acme/charts', which this host's build does not include");
    });
});
