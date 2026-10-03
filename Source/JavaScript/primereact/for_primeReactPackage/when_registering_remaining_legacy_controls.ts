// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDescriptorCatalog, findComponentDescriptor, resolveComponentName } from '@cratis/scene.engine';
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

    it('should offer canonical string enum choices while legacy renderers retain numeric support', () => {
        findComponentDescriptor(catalog, 'PrimeReact:fileUpload')!.properties.find(property => property.path === 'mode')!.choices!
            .map(choice => choice.value).should.deep.equal(['advanced', 'basic', 'auto']);
        findComponentDescriptor(catalog, 'PrimeReact:treeTable')!.properties.find(property => property.path === 'selectionMode')!.choices!
            .map(choice => choice.value).should.deep.equal(['none', 'single', 'multiple', 'checkbox']);
    });
});
