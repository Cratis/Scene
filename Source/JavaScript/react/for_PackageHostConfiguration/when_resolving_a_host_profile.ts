// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { componentRegistryKey } from '../packages';
import { resolvePackageHost } from '../packages/PackageHostConfiguration';

describe('when resolving a host profile', () => {
    const component = () => null;

    it('should select approved bundles in profile order', () => {
        const result = resolvePackageHost({
            profile: { name: 'web', targetPlatform: 'web', packages: ['Approved'] },
            policy: { allowExecutableImports: true, allowNetworkAssets: false },
            bundles: [{
                manifest: {
                    name: 'Approved', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: ['button'],
                    layouts: [], screenTemplates: [], dialogTemplates: [], themes: [], runtimeSingletons: ['react'],
                },
                components: { [componentRegistryKey('Approved', 'button')]: component },
            }],
        });

        result.diagnostics.should.be.empty;
        Object.keys(result.components).should.contain(componentRegistryKey('Approved', 'button'));
    });

    it('should report missing approved bundles and duplicate runtime singletons', () => {
        const result = resolvePackageHost({
            profile: { name: 'web', targetPlatform: 'web', packages: ['First', 'Second', 'Missing'] },
            policy: { allowExecutableImports: true, allowNetworkAssets: false },
            bundles: ['First', 'Second'].map(name => ({
                manifest: {
                    name, version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [],
                    screenTemplates: [], dialogTemplates: [], themes: [], runtimeSingletons: ['react'],
                },
                components: {},
            })),
        });

        result.blocked.should.be.true;
        result.diagnostics.length.should.equal(2);
        Object.keys(result.components).should.be.empty;
    });

    it('should reject duplicate bundle names, forbidden design-time imports, network assets and dependency version conflicts', () => {
        const result = resolvePackageHost({
            profile: { name: 'web', targetPlatform: 'web', packages: ['App'] },
            policy: { allowExecutableImports: false, allowNetworkAssets: false, loadDesignTime: true },
            bundles: [
                {
                    manifest: {
                        name: 'App', version: '1.0.0', kind: PackageKind.ComponentLibrary,
                        dependencies: [{ name: 'Base', versionRange: '^2.0.0' }], components: [], layouts: [], screenTemplates: [],
                        dialogTemplates: [], themes: [], assets: ['https://cdn.example.com/app.css'],
                    },
                    components: {},
                    designTime: { actions: {} },
                },
                {
                    manifest: {
                        name: 'Base', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [],
                        layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
                    },
                    components: {},
                },
                {
                    manifest: {
                        name: 'Base', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [],
                        layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
                    },
                    components: {},
                },
            ],
        });

        result.diagnostics.some(diagnostic => diagnostic.includes('duplicate bundles')).should.be.true;
        result.diagnostics.some(diagnostic => diagnostic.includes('forbids them')).should.be.true;
        result.diagnostics.some(diagnostic => diagnostic.includes('network assets')).should.be.true;
        result.diagnostics.some(diagnostic => diagnostic.includes('requires')).should.be.true;
        result.blocked.should.be.true;
        result.bundles.should.be.empty;
        result.assets.should.be.empty;
    });

    it('should expose approved contributions and font assets when diagnostics are clean', () => {
        const result = resolvePackageHost({
            profile: { name: 'web', targetPlatform: 'web', packages: ['Approved'] },
            policy: { allowExecutableImports: true, allowNetworkAssets: false },
            bundles: [{
                manifest: {
                    name: 'Approved', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: ['button'],
                    layouts: ['Shell'], screenTemplates: ['List'], dialogTemplates: ['Confirm'], themes: ['Light'],
                    assets: ['styles/app.css', 'fonts/app.woff2'],
                },
                components: { [componentRegistryKey('Approved', 'button')]: component },
                layouts: [{ name: 'Shell', slots: [] }],
                screenTemplates: [{ name: 'List', fitsSlot: 'content', slots: [], content: {} }],
                dialogTemplates: [{ name: 'Confirm', slots: [], content: {} }],
                themes: [{ name: 'Light', compatibleWith: ['Approved'], tokens: {} }],
            }],
        });

        result.blocked.should.be.false;
        result.layouts.map(layout => layout.name).should.deep.equal(['Shell']);
        result.screenTemplates.map(template => template.name).should.deep.equal(['List']);
        result.dialogTemplates.map(template => template.name).should.deep.equal(['Confirm']);
        result.themes.map(theme => theme.name).should.deep.equal(['Light']);
        result.fonts.should.deep.equal(['fonts/app.woff2']);
    });
});
