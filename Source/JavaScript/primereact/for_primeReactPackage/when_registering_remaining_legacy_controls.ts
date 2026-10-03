// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDescriptorCatalog, findComponentDescriptor, resolveComponentName, validateValue } from '@cratis/scene.engine';
import { UiProfile } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { primeReactPackage, primeReactPackageManifest } from '../primeReactPackage';

const profile: UiProfile = { name: 'web', targetPlatform: 'web', packages: ['PrimeReact'] };

describe('when registering remaining legacy controls', () => {
    const catalog = createDescriptorCatalog(primeReactPackage.descriptors);

    for (const name of ['fileUpload', 'dataScroller', 'treeTable', 'editor']) {
        describe(`and the control is '${name}'`, () => {
            it('should be declared, rendered, resolved, and editable', () => {
                primeReactPackageManifest.components.should.contain(name);
                primeReactPackage.components[componentRegistryKey('PrimeReact', name)].should.not.be.undefined;
                resolveComponentName(name, profile, { PrimeReact: primeReactPackageManifest.components })!.package.should.equal('PrimeReact');
                findComponentDescriptor(catalog, `PrimeReact:${name}`)?.properties.should.not.be.empty;
            });
        });
    }

    it('should offer the canonical string choices, then the original ordinals that migrated documents store', () => {
        findComponentDescriptor(catalog, 'PrimeReact:fileUpload')!.properties.find(property => property.path === 'mode')!.choices!
            .map(choice => choice.value).should.deep.equal(['advanced', 'basic', 'auto', 0, 1, 2]);
        findComponentDescriptor(catalog, 'PrimeReact:treeTable')!.properties.find(property => property.path === 'selectionMode')!.choices!
            .map(choice => choice.value).should.deep.equal(['none', 'single', 'multiple', 'checkbox', 0, 1, 2, 3]);
    });

    for (const [component, path, stored] of [['fileUpload', 'mode', [0, 1, 2, 'advanced']], ['treeTable', 'selectionMode', [0, 1, 2, 3, 'checkbox']]] as const) {
        it(`should accept every stored ${component} ${path} as valid, so an inspector shows it as the current choice`, () => {
            const descriptor = findComponentDescriptor(catalog, `PrimeReact:${component}`)!.properties.find(property => property.path === path)!;
            stored.map(value => validateValue(descriptor, value)).should.deep.equal(stored.map(() => undefined));
        });
    }
});
