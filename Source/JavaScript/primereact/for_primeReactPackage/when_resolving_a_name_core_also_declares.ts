// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageCatalog, resolveComponentName } from '@cratis/scene.engine';
import { UiProfile } from '@cratis/scene.model';
import { corePackageManifest } from '@cratis/scene.react';
import { primeReactPackageManifest } from '../primeReactPackage';

describe('when resolving a name core also declares', () => {
    const profile: UiProfile = { name: 'web', targetPlatform: 'web', packages: ['core', 'PrimeReact'] };
    const catalog: PackageCatalog = {
        core: corePackageManifest.components,
        PrimeReact: primeReactPackageManifest.components,
    };

    for (const name of ['text', 'button', 'card']) {
        describe(`and the name is '${name}'`, () => {
            const resolution = resolveComponentName(name, profile, catalog);

            it('should resolve it', () => {
                (resolution !== undefined).should.be.true;
            });

            it('should resolve to PrimeReact', () => {
                resolution!.package.should.equal('PrimeReact');
            });

            it('should record that core was shadowed', () => {
                resolution!.shadows.should.deep.equal(['core']);
            });
        });
    }

    describe('and the name is only declared by PrimeReact', () => {
        const resolution = resolveComponentName('dataTable', profile, catalog);

        it('should resolve to PrimeReact', () => {
            resolution!.package.should.equal('PrimeReact');
        });

        it('should shadow nothing', () => {
            resolution!.shadows.should.deep.equal([]);
        });
    });
});
