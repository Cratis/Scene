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

        result.diagnostics.length.should.equal(2);
    });
});
